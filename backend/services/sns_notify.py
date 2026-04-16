import os
from dotenv import load_dotenv

load_dotenv()

# SNS integration has been removed. Keep placeholder functions here so imports remain safe.

def is_email_subscribed(email: str) -> bool:
    print("[INFO] SNS integration removed; email subscription checks are disabled.")
    return False


def subscribe_user_to_topic(email: str):
    print("[INFO] SNS integration removed; subscribe_user_to_topic is disabled.")
    return None


def notify_member_of_new_repo(
    email: str,
    challenge_title: str,
    repo_name: str,
    clone_url: str | None,
    api_description: str | None = None
):
    print("[INFO] SNS integration removed; repo notification is disabled.")
    return None
