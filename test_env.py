import os

def test_env():
    import sys
    sys.path.append(r"c:\Users\DELL\OneDrive\Desktop\RestroScan_Project\backend\Backendcode")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backendcode.settings')
    import django
    django.setup()
    from django.conf import settings
    print("RAZORPAY_KEY_ID:", settings.RAZORPAY_KEY_ID)
    print("RAZORPAY_KEY_SECRET:", settings.RAZORPAY_KEY_SECRET)

if __name__ == "__main__":
    test_env()
