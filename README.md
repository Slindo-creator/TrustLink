# TrustLink

> Where trust meets trade.

TrustLink is a digital trust platform designed to connect informal businesses with customers through transparent, verifiable, and up-to-date business information.

##  The Problem

Informal businesses play an important role in local communities and economies, but building trust between vendors and customers can be difficult.
Customers often discover informal businesses through social media, word of mouth, or referrals. However, these channels do not always provide reliable or up-to-date information about:

- Whether a vendor is legitimate
- Whether products are actually available
- Whether advertised prices are current
- Whether the product matches its advertisement
- Whether the vendor has a trustworthy reputation
- Whether a transaction is safe

As a result, customers often rely on physical visits, cash-on-delivery, or recommendations from people they know before feeling comfortable purchasing.
Trust is also a two-way challenge. Vendors can face fraudulent customers, fake payments, robberies, and other risks.

### The Trust Gap

**Customers need to trust vendors.**
**Vendors need to trust customers.**
TrustLink aims to create a trusted digital layer between them.

---

## Our Solution

TrustLink provides a platform where informal businesses can establish a credible digital presence while customers can make more informed decisions about who they trade with.

The platform will focus on:

- Vendor identity and business verification
- Transparent vendor profiles
- Current business information
- Product and availability updates
- Location information
- Customer reputation and feedback
- Trust signals for both vendors and customers
- Safer and more transparent interactions

TrustLink does not simply tell users who to trust. It provides transparent information and trust signals that allow customers and vendors to make better-informed decisions.

---
## Target Users

### Customers

People looking for products or services from informal businesses and local traders.

### Informal Businesses

Street vendors, small traders, home-based businesses, and other informal businesses looking to reach customers and establish credibility.

---

## User Journey

### Customer Journey

1. Customer searches for a product or service.
2. TrustLink displays relevant local businesses.
3. Customer views the vendor's profile and trust information.
4. Customer checks current product, price, availability, and location information.
5. Customer chooses how to interact or purchase.
6. Transaction takes place.
7. Customer provides feedback that contributes to the vendor's reputation.

### Vendor Journey

1. Vendor creates a TrustLink business profile.
2. Vendor provides information required for verification.
3. Vendor lists products or services.
4. Vendor keeps availability and business information updated.
5. Customers discover the business through TrustLink.
6. Vendor interacts with potential customers.
7. Completed legitimate transactions contribute to the vendor's reputation.

---

## Hackathon MVP

The initial TrustLink MVP will focus on demonstrating the core trust concept rather than attempting to solve every challenge in informal commerce.

The MVP will demonstrate:

- Vendor registration
- Vendor verification
- Vendor profiles
- Product/service listings
- Current availability information
- Location
- Trust indicators
- Customer feedback/reputation
- Customer discovery

Advanced capabilities such as automated fraud detection, advanced payment protection, and large-scale transaction infrastructure will be considered for future development.

---

## Technical Architecture
The architecture below is scoped for hackathon speed — low setup overhead, minimal moving parts, and tools the team is already comfortable with.

- ** Frontend: React
- ** Backend: Node.js / Express (REST API)
- **Database: PostgreSQL
- ** Authentication: Supabase Auth 
** Hosting: Vercel (frontend) + Render (backend) + Supabase (database)
**Version Control: Git/GitHub

Note: AWS and Docker were considered but dropped for the hackathon build — the managed free-tier hosting above gets the app live in minutes rather than hours, without sacrificing credibility. Both remain reasonable additions for a post-hackathon, production-grade iteration.

### High-Level Architecture

```text
                ┌──────────────────┐
                │   TrustLink User │
                │ Customer / Vendor│
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   React Frontend │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   Backend API    │
                │    Node.js       │
                └────────┬─────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │ User/Auth  │ │ Vendor Data│ │ Reputation │
   │   Service  │ │ & Products │ │   System   │
   └────────────┘ └────────────┘ └────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    Database      │
                └──────────────────┘
