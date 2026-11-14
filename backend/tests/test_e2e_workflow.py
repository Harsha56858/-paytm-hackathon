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

class TestEndToEndVoiceToCRMWorkflow(unittest.TestCase):
    def test_complete_human_in_the_loop_lifecycle(self):
        # Step 8 & 9: AI Voice agent executes save_callback_request webhook
        sarvam_payload = {
            "customer_name": "Siddharth Verma",
            "phone_number": "9845012345",
            "preferred_time": "Monday, 11:30 AM IST",
            "reason": "Customer requested callback to discuss enterprise pricing for 50 agents"
        }
        res_voice = requests.post(
            f"{API_BASE_URL}/api/v1/voice/callbacks",
            json=sarvam_payload,
            headers={"X-API-Key": VOICE_API_KEY},
            timeout=5
        )
        self.assertEqual(res_voice.status_code, 201)
        voice_data = res_voice.json()
        self.assertTrue(voice_data.get("success"))
        callback_id = voice_data.get("callback_id")
        self.assertTrue(callback_id)

        # Step 10 & 11: Stored in PostgreSQL, CRM retrieves it
        res_get = requests.get(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{callback_id}",
            timeout=5
        )
        self.assertEqual(res_get.status_code, 200)
        record = res_get.json()
        self.assertEqual(record["customer_name"], "Siddharth Verma")
        self.assertEqual(record["status"], "pending_review")
        self.assertIsNone(record["updated_at"])

        # Step 12 & 13: Administrator opens request and marks it Contacted with notes
        contact_payload = {
            "status": "contacted",
            "follow_up_notes": "Contacted customer on 9845012345. Discussed 50-seat AI voice rollout. Scheduled demo."
        }
        res_contact = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{callback_id}",
            json=contact_payload,
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res_contact.status_code, 200)
        updated_1 = res_contact.json()["callback"]
        self.assertEqual(updated_1["status"], "contacted")
        self.assertIn("Scheduled demo", updated_1["follow_up_notes"])
        self.assertIsNotNone(updated_1["updated_at"])
        self.assertEqual(updated_1["updated_by"], "Workspace Admin")

        # Step 14 & 15: Administrator marks request Completed after demo
        completed_payload = {
            "status": "completed",
            "follow_up_notes": "Demo conducted successfully. Proposal sent; customer accepted contract."
        }
        res_complete = requests.patch(
            f"{API_BASE_URL}/api/v1/voice/callbacks/{callback_id}",
            json=completed_payload,
            headers={"X-Admin-Token": ADMIN_API_KEY},
            timeout=5
        )
        self.assertEqual(res_complete.status_code, 200)
        updated_2 = res_complete.json()["callback"]
        self.assertEqual(updated_2["status"], "completed")
        self.assertIn("contract", updated_2["follow_up_notes"])

        # Step 16: Verify stats aggregation reflects the completed request
        res_stats = requests.get(f"{API_BASE_URL}/api/v1/voice/callbacks/stats", timeout=5)
        self.assertEqual(res_stats.status_code, 200)
        stats = res_stats.json()
        self.assertGreaterEqual(stats["completed"], 1)

if __name__ == "__main__":
    unittest.main()
