---
title: Privacy Policy
description: Privacy policy for MyInboxReport. Learn how your data is handled — locally, in your browser, with no servers involved.
lastUpdated: February 14, 2026
---

## Overview

MyInboxReport is a privacy-first, local-only Gmail analytics tool. We do not operate servers that receive, store, or process your email data. Everything runs entirely in your web browser.

## Data We Do Not Collect

- We do not collect, transmit, or store your emails or email content.
- We do not collect your Google account credentials or tokens on any server.
- We do not use cookies for tracking or advertising.
- We do not sell, share, or monetize your data in any form.
- We do not use analytics services that track individual users.

## How Your Data Is Handled

When you connect your Gmail account, the following happens entirely within your browser:

1. **Authentication:** You sign in via Google Identity Services. The OAuth access token is stored in browser memory only and expires after approximately one hour. We never see or store this token on any server.
2. **Email fetching:** Your browser makes direct API calls to Gmail using your access token. Email data travels from Google directly to your browser — it never passes through our infrastructure.
3. **Local storage:** Fetched emails and parsed results are stored in your browser's IndexedDB. This data exists only on your device and is never transmitted anywhere.
4. **AI parsing (optional):** If you configure an AI provider, email content is sent to the provider you choose (e.g., a local Ollama instance, OpenAI, or Anthropic). This is a direct connection between your browser and your chosen provider. We are not involved in this communication. If you use a local model like Ollama, your data never leaves your machine.

## Google API Scopes

We request the `gmail.readonly` scope only. This grants read-only access to your emails. We cannot send, delete, modify, or manage your emails or Gmail settings.

## Google API Services User Data Policy

MyInboxReport's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

## Third-Party AI Providers

If you choose to use a cloud-based AI provider (OpenAI or Anthropic), portions of your email content will be sent to that provider for classification and extraction. This is your choice and configured by you. Each provider has their own privacy policy:

- **Ollama (local):** Runs entirely on your machine. No data leaves your device.
- **OpenAI:** Subject to [OpenAI's Privacy Policy](https://openai.com/policies/privacy-policy).
- **Anthropic:** Subject to [Anthropic's Privacy Policy](https://www.anthropic.com/privacy).

## Data Deletion

Since all data is stored locally in your browser, you have full control:

- Use the "Clear all data" button in Settings to delete everything.
- Clear your browser's site data for this domain.
- Revoke access via your [Google Account permissions](https://myaccount.google.com/permissions).

## Open Source

This application is open source. You can audit the full source code at [GitHub](https://github.com/Ashish-Sontakke/myinboxreport) to verify these claims.

## Changes to This Policy

We may update this policy from time to time. Changes will be posted on this page with an updated date. Since we don't collect email addresses, we cannot notify you directly — please check back periodically.

## Contact

If you have questions about this privacy policy, you can open an issue on [GitHub](https://github.com/Ashish-Sontakke/myinboxreport).
