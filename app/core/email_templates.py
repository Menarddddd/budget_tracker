def verification_email_template(
    username: str, token: str, base_url: str = "http://localhost:3000"
) -> str:
    verification_link = f"{base_url}/verify-email?token={token}"

    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

        <h2>Welcome to Budget Tracker, {username}!</h2>

        <p>Thank you for registering. Please verify your email address
           to activate your account.</p>

        <a href="{verification_link}"
           style="
             background-color: #4CAF50;
             color: white;
             padding: 14px 20px;
             text-decoration: none;
             border-radius: 4px;
             display: inline-block;
           ">
          Verify Email Address
        </a>

        <p style="color: #888; font-size: 12px;">
          This link expires in 24 hours.
          If you did not create an account, ignore this email.
        </p>

        <p style="color: #888; font-size: 12px;">
          Or copy and paste this link into your browser:<br>
          {verification_link}
        </p>

      </body>
    </html>
    """
