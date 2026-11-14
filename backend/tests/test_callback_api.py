import os
import sys
import unittest
from pathlib import Path
import requests

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from dotenv import load_dotenv
load_dotenv(BASE_DIR / ".env", override=True)

API_BASE_URL = "http://127.0.0.1:8001"
VOICE_API_KEY = os.getenv("VOICE_API_KEY")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

class TestCallbackAPI(unittest.TestCase):
    def setUp(self):
        self.assertTrue(VOICE_API_KEY, "VOICE_API_KEY must be defined")
        self.assertTrue(ADMIN_API_KEY, "ADMIN_API_KEY must be defined")

    def test_01_health_check(self):
        res = requests.get(f"{API_BASE_URL}/health", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("database"), "connected")

    def test_02_voice_create_callback_unauthorized(self):
        payload = {
            "customer_name": "Test Customer",
            "phone_number": "9988776655",
            "preferred_time": "Tomorrow at 4 PM",
            "reason": "Voice API auth test"
        }
        res = requests.post(
            f"{API_BASE_URL}/api/v1/voice/callbacks",
            json=payload,
            headers={"X-API-Key": "invalid_voice_key"},
            timeout=5
        )
        self.assertEqual(res.status_code, 401)

    def test_03_voice_create_callback_authorized(self):
        payload = {
            "customer_name": "Automated Test Customer",
            "phone_number": "9998887776",
            "preferred_time": "16 Nov, 2:00 PM",
            "reason": "Automated callback verification test"
        }
        res = requests.post(
            f"{API_BASE_URL}/api/v1/voice/callbacks",
            json=payload,
            headers={"X-API-Key": VOICE_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("callback_id", data)
        self.__class__.created_callback_id = data["callback_id"]

    def test_04_get_all_callbacks(self):
        res = requests.get(f"{API_BASE_URL}/api/v1/voice/callbacks", timeout=5)
        self.assertEqual(res.status_code, 200)
        items = res.json()
        self.assertIsInstance(items, list)
        self.assertGreater(len(items), 0)

        found = any(c["id"] == self.created_callback_id for c in items)
        self.assertTrue(found, "Newly created callback must appear in listing")

    def test_05_update_callback_unauthorized(self):
        cid = self.created_callback_id
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={"status": "contacted"},
            timeout=5
        )
        self.assertEqual(res.status_code, 401, "PATCH without admin token must return 401")

        res_wrong = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={"status": "contacted"},
            headers={"X-Admin-Token": "wrong_token_here"},
            timeout=5
        )
        self.assertEqual(res_wrong.status_code, 401, "PATCH with wrong admin token must return 401")

    def test_06_update_callback_invalid_status(self):
        cid = self.created_callback_id
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={"status": "not_a_valid_status"},
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 422, "Invalid status must trigger validation error (422)")

    def test_07_update_callback_empty_notes(self):
        cid = self.created_callback_id
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={"follow_up_notes": "   "},
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 422, "Whitespace-only notes must trigger validation error (422)")

    def test_08_update_callback_non_existent(self):
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/00000000-0000-0000-0000-000000000000",
            json={"status": "contacted", "follow_up_notes": "test"},
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 404, "Non-existent callback ID must return 404")

    def test_09_update_callback_to_contacted(self):
        cid = self.created_callback_id
        notes = "Called customer; discussed enterprise pricing and requirements."
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={
                "status": "contacted",
                "follow_up_notes": notes
            },
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        cb = data.get("callback")
        self.assertEqual(cb["status"], "contacted")
        self.assertEqual(cb["follow_up_notes"], notes)
        self.assertIsNotNone(cb["updated_at"])
        self.assertEqual(cb["updated_by"], "Workspace Admin")

    def test_10_update_callback_to_completed(self):
        cid = self.created_callback_id
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={"status": "completed"},
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 200)
        cb = res.json().get("callback")
        self.assertEqual(cb["status"], "completed")
        # Ensure previous notes were preserved
        self.assertIn("enterprise pricing", cb["follow_up_notes"])

    def test_11_update_callback_to_cancelled(self):
        cid = self.created_callback_id
        res = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{cid}",
            json={
                "status": "cancelled",
                "follow_up_notes": "Customer cancelled callback via SMS."
            },
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res.status_code, 200)
        cb = res.json().get("callback")
        self.assertEqual(cb["status"], "cancelled")

    def test_12_callback_stats_accuracy(self):
        res = requests.get(f"{API_BASE_URL}/api/v1/voice/callbacks/stats", timeout=5)
        self.assertEqual(res.status_code, 200)
        stats = res.json()
        self.assertIn("total", stats)
        self.assertIn("pending_review", stats)
        self.assertIn("contacted", stats)
        self.assertIn("completed", stats)
        self.assertIn("cancelled", stats)
        self.assertEqual(
            stats["total"],
            stats["pending_review"] + stats["contacted"] + stats["completed"] + stats["cancelled"]
        )

if __name__ == "__main__":
    unittest.main()
