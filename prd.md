📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)
Product Name (working)

Category: Companion / Experience / Time Marketplace

Safe App Name Options (Nepal-friendly)

Pick something neutral and human:

Hourmate

TimeLoop

Companio

MeetByHour

SideBySide

Hangoutly

TogetherTime

Avail

⚠️ Avoid words like: date, hire, rent, paid date, escort

1. Product Vision

A verified, consent-driven platform where adults can offer and book time-based companionship for predefined, non-sexual activities such as:

watching movies

walking

hiking

attending events

conversations

social company

The platform does NOT sell people or physical intimacy.

2. Target Users

Age: 18–35

Location: Nepal (city-based launch)

Use cases:

People seeking company

People monetizing their free time

New city loneliness

Event companions

Safe social meetups

3. Legal & Safety Positioning (VERY IMPORTANT)
Core Legal Statement (shown everywhere)

This platform facilitates time-based companionship only.
Any form of sexual service, physical intimacy, or coercion is strictly prohibited.

Mandatory Rules

Consent is explicit & revocable

Activities must be predefined

Public locations encouraged

No physical intimacy expectation

Violations = permanent ban

4. User Roles
1. User (Buyer)

Browse profiles

Book time

Pay manually (QR)

Chat during active session

Raise complaints

2. Companion (Seller)

Offer time

Set hourly rate

Control availability

Accept / reject bookings

Request payment

3. Admin

Verify users

Moderate reports

Freeze / ban accounts

Resolve disputes

5. Onboarding Flow
Step 1: Account Creation

Phone number (OTP)

Password

Step 2: Identity Verification (Mandatory)

Full name

Date of birth

Gender

NID / Nagarikta upload

Real selfie photo

City + area

Profession (optional)

Bio (text)

⏳ Status: Pending Verification

Step 3: Admin Review

Approve / reject

Manual verification

6. Profile Structure
Public Profile

First name (no surname)

Age

Gender

City

Profession

Bio

Gallery (3–5 images)

Hourly rate

Available activities (tags)

Availability status (ON / OFF)

Hidden When:

Availability = OFF

Account under review

User blocked

7. Location System

Manual input: Area – City

Auto-detect (browser geolocation)

City-based filtering:

Kathmandu

Pokhara

Lalitpur (later)

8. Discovery & Filters

City

Gender

Price range

Availability

Activity tags

Age range

9. Booking Flow (Core Feature)
Step 1: Select Companion

Choose date

Choose start time

Choose duration (hour-based)

Select activity

See total cost

Step 2: Booking Request

Sent to companion

Status: Pending

Step 3: Accept / Reject

If accepted:

Chat opens

Seller can send payment request

10. Payment Flow (Manual QR)
Seller Setup

Upload payment QR

Payment method label (eSewa / Khalti / Bank)

Payment Steps

Seller sends payment request

Buyer sees QR

Buyer pays externally

Buyer taps “Paid”

Seller manually confirms

Booking becomes Active

⚠️ Platform clearly states:

Platform does not handle payments directly in V1.

11. Chat System (Time-Locked)
Rules

Chat opens only after booking accepted

Chat available:

From booking start time

Until booking end time

+30 minutes grace period

After expiry:

Chat auto-deleted

No re-access

Re-book required

12. Real-Time Notifications (Important)
Trigger Events

Booking request

Booking accepted / rejected

Payment request

Payment confirmation

Session starting soon

Session ended

Complaint raised

Admin action

Tech (Supabase)

Realtime subscriptions

Postgres triggers

In-app notifications (V1)

Email later (V2)

13. Safety & Controls
User Controls

Block user

Report user

Emergency support button

Complaint Types

Payment not received

Misbehavior

No-show

Harassment

Rule violation

Admin Actions

Temporary freeze

Evidence review

Permanent ban

14. Consent & Rules (Mandatory Modal)

Shown:

During signup

Before first booking

Before chat opens

User must accept:

No physical intimacy

Respect boundaries

Public meeting preference

Zero tolerance for coercion

15. Favorites & Re-order

Save profiles

Quick re-book

Past booking history

16. Admin Dashboard (MVP)

User verification queue

Booking list

Complaints list

Manual override

Audit logs

17. Tech Stack (Confirmed)
Frontend

Web App

Next.js (TypeScript)

Tailwind CSS

Backend

Supabase

Auth (phone)

Postgres

Storage (images)

Realtime

Edge functions (logic)

Notifications

Supabase Realtime

DB triggers

18. Database Core Tables (High-Level)

users

profiles

verifications

bookings

payments

chats

messages

complaints

blocks

favorites

notifications

19. V1 Scope (Solo-friendly)

✅ Must-have

Verification

Booking

Chat

Manual payment

Notifications

Complaints


Automated escrow

Reviews

AI moderation

Push notifications


20. Final Honest Take

You’re thinking like a real founder, not a dreamer.
This is launchable, defensible, and buildable solo.

Your biggest risks are:

wording

moderation

safety enforcement

Your biggest advantage:

local context + realistic scope