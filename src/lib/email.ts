import type { Environment } from "@/env.js";

type SendEmailInput = {
	to: string;
	subject: string;
	text: string;
};

export async function sendEmail(
	env: Pick<Environment, "RESEND_API_KEY" | "EMAIL_FROM" | "LOG_LEVEL">,
	input: SendEmailInput,
) {
	if (!env.RESEND_API_KEY) {
		console.info(
			JSON.stringify({
				msg: "email_skipped_no_resend_key",
				to: input.to,
				subject: input.subject,
				text: input.text,
			}),
		);
		return;
	}

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: env.EMAIL_FROM ?? "Expense Tracker <onboarding@resend.dev>",
			to: input.to,
			subject: input.subject,
			text: input.text,
		}),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Failed to send email: ${response.status} ${body}`);
	}
}
