from urllib.parse import quote_plus


def verification_email_template(
    username: str, token: str, base_url: str = "http://localhost:5173"
) -> str:
    verification_link = f"{base_url}/verify-email?token={quote_plus(token)}"

    return f"""
    <html>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">

          <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Budget Tracker</h1>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin-top: 0; color: #111827;">Welcome, {username}!</h2>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              Thank you for registering. Please verify your email address to activate your account.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a
                href="{verification_link}"
                style="
                  display: inline-block;
                  background-color: #3b82f6;
                  color: white;
                  text-decoration: none;
                  padding: 14px 24px;
                  border-radius: 10px;
                  font-size: 15px;
                  font-weight: bold;
                "
              >
                Verify Email
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If the button above does not work, copy and paste this link into your browser:
            </p>

            <div style="word-break: break-all; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; font-size: 13px; color: #374151;">
              {verification_link}
            </div>

            <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                This link expires in <strong>24 hours</strong>.<br>
                If you did not create an account, you can safely ignore this email.
              </p>
            </div>
          </div>

        </div>
      </body>
    </html>
    """


def change_email_verification_template(username: str, token: str) -> str:
    return f"""
    <html>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">

          <div style="background-color: #f59e0b; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Budget Tracker</h1>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin-top: 0; color: #111827;">Hello, {username}</h2>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              We received a request to change your email address.
              Please use the verification token below to confirm this change.
            </p>

            <div style="margin: 28px 0; text-align: center;">
              <p style="margin-bottom: 10px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                Your Email Change Token
              </p>
              <div style="
                display: inline-block;
                background-color: #fffbeb;
                border: 1px dashed #f59e0b;
                color: #b45309;
                padding: 16px 24px;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 3px;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
              ">
                {token}
              </div>
            </div>

            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              Enter this token in the app to confirm your new email address.
            </p>

            <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                If you did not request this email change, please ignore this message
                and secure your account immediately.
              </p>
            </div>
          </div>

        </div>
      </body>
    </html>
    """
