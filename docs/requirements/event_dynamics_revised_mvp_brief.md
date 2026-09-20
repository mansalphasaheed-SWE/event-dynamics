# Event Dynamics — Revised Minimum Viable Product Brief

**Company:** Tabempa Engineering  
**Document status:** Draft for review  
**Version:** 2.1  
**Product focus:** AI-native event planning, logistics, and ticketing  
**Ticketing status:** Approved for the MVP

---

## 1. Document purpose

This document defines the first version of Event Dynamics.

Event Dynamics will help organizers plan, prepare, and run events from one connected workspace. Its AI agents will help an organizer create a suitable event plan, research decisions, find missing work, understand the effects of changes, and carry out approved actions.

The MVP will focus on event logistics and ticketing. It will not attempt to provide every possible feature in either area. Instead, it will provide the records, connections, controls, and AI actions needed to plan a real event, sell admission, admit attendees, and run the operation.

---

## 2. Product vision

Event planning is spread across spreadsheets, documents, emails, messages, and people's memories. A change in one part of a plan may require updates in several other places. Organizers spend time finding those places, telling the right people, checking the budget, and trying to prevent missed work.

Event Dynamics will keep the event plan connected.

When an organizer changes an important detail, the platform should help answer:

- What else does this affect?
- What new problems could this create?
- What needs to be changed?
- Who needs to know?
- How will the cost and event readiness change?
- Which actions can the platform complete after approval?

The main product promise is:

> Event Dynamics understands your event plan. When something changes, it finds what is affected, explains the likely results, and carries out the changes you approve.

---

## 3. MVP goals

The MVP should allow an organizer to:

1. Describe an event in plain language and receive a useful first plan.
2. Create and manage the main parts of the event from one workspace.
3. Assign work and make ownership clear.
4. Connect sessions, rooms, staff, vendors, resources, costs, and tasks.
5. See whether the event is ready and what is at risk.
6. Run the event from a shared internal schedule.
7. Report and resolve event-day problems.
8. Explain a change to the planning agent and see what it affects.
9. Review proposed changes before the action agent applies them.
10. Keep a history of changes, approvals, and AI actions.
11. Build useful organizer memory from the first day of use.
12. Create free and paid ticket types and sell them without overselling.
13. Give every attendee a valid ticket and reliable delivery method.
14. Admit attendees quickly, including when the venue internet is unavailable.
15. Connect ticket sales and attendance changes to the logistics plan.

---

## 4. Organizations, users, roles, and access

### 4.1 Organization workspaces

Event Dynamics is a multi-organization platform. Each organization has its own isolated workspace containing its members, events, settings, approved templates, organizer memory, and commercial information.

Information belonging to one organization must not be visible or available to another organization unless an authorized user is separately invited to both.

One user account can belong to more than one organization. The user selects the organization they want to work in and can only see the events allowed by their membership in that organization.

The organization is the main ownership boundary. Events, tickets, attendees, payments, vendors, resources, files, memories, and activity history belong to an organization even when access is limited to one event.

### 4.2 User accounts and sign-in

Every organizer, manager, team leader, team member, and viewer uses their own Event Dynamics account. Login details must not be shared.

The MVP supports:

- Email and password sign-in
- Email-address verification
- Forgotten-password recovery
- Sign-out from the current device
- Sign-out from all devices
- Account suspension by an authorized organization user

A user account includes:

- Full name
- Verified email address
- Phone number where provided
- Password or approved sign-in credential
- Preferred time zone
- Account status
- Organization and event memberships

Account states:

```text
Pending verification → Active
```

An account may also be suspended or closed.

Google, Microsoft, company single sign-on, passkeys, and phone-number-only login are outside the MVP.

Purchasers and attendees do not need a team account to buy or use a ticket. They access orders and tickets through secure links sent to their order email address. Buying a ticket does not make someone an organization or event team member.

### 4.3 Membership levels

Access is assigned at two levels:

```text
User account
├── Organization membership
└── Event membership
```

Organization membership controls organization-wide access. Event membership controls access to one event.

A person may be:

- An organization member with access to assigned events
- An Organization Owner or Organization Admin with wider organization access
- An external event member who can access one event without joining the organization as a permanent member

Event Owners and Event Managers must be members of the organization that owns the event. Team Leaders, Team Members, Viewers, and custom-role users may be organization members or external event members.

### 4.4 Fixed organization roles

Organization roles are fixed in the MVP. Organizations cannot create custom organization roles.

#### Organization Owner

Organization Owners can:

- View and update organization details
- Manage organization billing and subscription information
- Invite, remove, suspend, and reactivate organization members
- Assign Organization Owner, Organization Admin, and Organization Member roles
- View and manage every event owned by the organization
- Create events
- Manage organization-wide templates and approved memory
- Enable or disable organizational AI, accept updated AI terms, and choose the organization action mode
- Pause all automatic AI actions across the organization
- Manage organization data-retention settings within allowed legal limits
- View organization-wide reports and activity history
- Create and manage event-level custom roles
- Recover an event that has no active Event Owner
- Connect, replace, or disconnect the organization's Monime business Space

An organization must always have at least one active Organization Owner. The final active owner cannot leave, be removed, or be suspended until another active owner is assigned.

#### Organization Admin

Organization Admins can:

- View and update organization details except ownership and billing
- Invite Organization Admins and Organization Members
- Remove or suspend Organization Admins and Organization Members
- View all organization members
- Create events
- Access every organization event with Event Manager permissions
- Manage organization-wide templates and approved memory
- View the organization's current AI status, action mode, and automatic-action history
- Manage organization data-retention settings within allowed legal limits
- View organization-wide reports and activity history
- Create and manage event-level custom roles

Organization Admins cannot:

- View or change organization billing details
- Add, remove, suspend, or change an Organization Owner
- Delete the organization
- Transfer organization ownership
- Override Event Owner-only approval for event cancellation or refunds

#### Organization Member

Organization Members can:

- View basic organization identity information
- View the organization member directory
- Create a new event and become its Event Owner
- Access events to which they are assigned
- Use approved organization templates and memory in an allowed event
- Update their own profile

Organization Members cannot manage organization settings, billing, members, roles, company memory, organization reports, or events to which they are not assigned.

Any verified user who is not suspended may create a new organization. The creator automatically becomes its first Organization Owner.

#### Organization permission summary

| Organization action | Owner | Admin | Member |
|---|---:|---:|---:|
| View organization profile | Yes | Yes | Yes |
| Edit organization profile | Yes | Yes | No |
| Manage billing and subscription | Yes | No | No |
| Connect or manage Monime business Space | Yes | No | No |
| Add or manage owners | Yes | No | No |
| Invite admins and members | Yes | Yes | No |
| Remove or suspend admins and members | Yes | Yes | No |
| View every organization event | Yes | Yes | No |
| Create an event | Yes | Yes | Yes |
| Manage organization templates and approved memory | Yes | Yes | No |
| Enable or disable organizational AI and accept AI terms | Yes | No | No |
| Choose the organization action mode | Yes | No | No |
| View organization AI status and automatic-action history | Yes | Yes | No |
| Pause all automatic AI actions across the organization | Yes | No | No |
| Manage organization data-retention settings | Yes | Yes | No |
| View organization-wide reports and history | Yes | Yes | No |
| Create event-level custom roles | Yes | Yes | No |
| Delete the organization | Yes | No | No |

Deleting an organization must be separately confirmed and cannot be performed through a normal event screen or direct AI instruction.

### 4.5 Fixed event roles

Each event team member has exactly one event role for that event. The role can be one of the fixed roles below or one custom event role.

#### Event Owner

The person who owns the event workspace and has final control.

Each event has one primary Event Owner. The event creator becomes the Event Owner unless ownership is assigned by an Organization Owner. Event ownership can be transferred only to another active member of the organization. An Organization Owner can recover ownership when the current Event Owner is unavailable.

They can:

- Manage the event
- Invite the team
- Control permissions
- Approve important AI actions
- View private financial and contact information

#### Event Manager

The person responsible for planning and running the event.

They can:

- Manage most event information
- Assign work
- Manage the internal schedule
- Review readiness
- Handle changes and problems
- Approve actions if the owner allows it

#### Team Leader

The person responsible for one part of the event, such as registration, logistics, food, security, or sound.

They can:

- View their team's work
- Assign or update allowed tasks
- Update the state of schedule items
- Report and manage problems in their area

#### Team Member

A person carrying out assigned work.

They can:

- View their shifts, tasks, and instructions
- Update assigned work
- Add notes and files
- Report problems

#### Viewer

A person who can view approved information but cannot change it.

### 4.6 Fixed event-role permission summary

The table below defines the default access for fixed event roles.

- **All:** Access applies across the event.
- **Scoped:** Access applies only to assigned teams, areas, locations, or work.
- **Own:** The user can act only on work assigned to them or incidents they report.
- **View:** Read-only access to non-sensitive information shared with the role.
- **No:** The role does not receive the permission.

| Event action | Event Owner | Event Manager | Team Leader | Team Member | Viewer |
|---|---:|---:|---:|---:|---:|
| View event details | All | All | View | View | View |
| Edit event details | All | All | No | No | No |
| Publish or pause event | All | All | No | No | No |
| Change normal event status | All | All | No | No | No |
| Prepare event cancellation | All | All | No | No | No |
| Approve event cancellation | All | No | No | No | No |
| Archive completed event | All | All | No | No | No |
| View event team | All | All | Scoped | Scoped | No |
| View team contact details | All | All | Scoped | Scoped | No |
| Invite event members | All | All | No | No | No |
| Assign fixed or existing custom roles | All | All | No | No | No |
| Remove event members | All | All | No | No | No |
| Create or change custom roles | All | No | No | No | No |
| Manage shifts and responsibilities | All | All | Scoped | Own | No |
| View programme | All | All | All | View | View |
| Manage sessions and public activities | All | All | Scoped | No | No |
| Manage tracks, speakers, and moderators | All | All | Scoped | No | No |
| Publish programme changes | All | All | No | No | No |
| View all tasks | All | All | Scoped | Own | View |
| Create and assign tasks | All | All | Scoped | No | No |
| Update tasks | All | All | Scoped | Own | No |
| View run of show | All | All | Scoped | Own | View |
| Manage run of show | All | All | Scoped | Own status only | No |
| Send operational announcements | All | All | Scoped | No | No |
| View venue and rooms | All | All | Scoped | Related work | View |
| Manage venue and rooms | All | All | Scoped | No | No |
| View vendors and deliveries | All | All | Scoped | Related work | No |
| Manage vendors and deliveries | All | All | Scoped | Own status only | No |
| View resources | All | All | Scoped | Related work | View |
| Manage resources | All | All | Scoped | Own status only | No |
| View budget totals and expenses | All | All | No | No | No |
| Manage budget and expenses | All | All | No | No | No |
| Approve planned expenses | All | All | No | No | No |
| View ticket revenue and payments | All | All | No | No | No |
| Request ticket refund | All | All | No | No | No |
| Approve ticket refund work | All | No | No | No | No |
| Manage payment disputes | All | All | No | No | No |
| Manage ticket types and sales | All | All | No | No | No |
| Manage event purchase terms, refund policy, privacy notice, and consent settings | All | All | No | No | No |
| View orders and tickets | All | All | No | No | No |
| Manage attendee records and imports | All | All | No | No | No |
| Manage ticket delivery and replacement | All | All | No | No | No |
| Cancel tickets or orders | All | All | No | No | No |
| Issue approved free tickets | All | All | No | No | No |
| View basic attendee information | All | All | No | No | No |
| View private attendee needs | All | All | No | No | No |
| Export attendee information | All | All | No | No | No |
| Perform attendee check-in | All | All | No | No | No |
| Prepare offline check-in device | All | All | No | No | No |
| Undo check-in | All | All | No | No | No |
| Resolve offline check-in conflict | All | All | No | No | No |
| Manage invitations and RSVP | All | All | No | No | No |
| View normal risks and incidents | All | All | Scoped | Own | No |
| Create and manage risks and backup plans | All | All | Scoped | No | No |
| Report incident | All | All | All | All | No |
| Manage normal incidents | All | All | Scoped | Own comments | No |
| View or manage sensitive incidents | All | All | No | No | No |
| Use planning agent | All | All | Scoped | No | No |
| Use action agent | All | All | Scoped | Own | No |
| Approve high-impact AI actions | All | Within manager access | No | No | No |
| Create, change, pause, or end event automatic-action rules | All | Within manager access | No | No | No |
| View event automatic-action rules and history | All | All | Scoped | Own related actions | No |
| Pause all automatic AI actions for the event | All | All | No | No | No |
| View event memory | All | All | Scoped | No | No |
| Manage event memory | All | All | No | No | No |
| View event dashboard and reports | All | All | Scoped | Own | View |
| Export operational reports | All | All | No | No | No |
| View complete event activity history | All | All | No | No | No |

Event Owners have all Event Manager permissions plus ownership-only actions. Organization Owners also have Event Owner-level access to every organization event. Organization Admins have Event Manager-level access to every organization event but do not receive Event Owner-only approvals.

### 4.7 Event permission catalogue

Custom event roles are built from the permissions below.

#### Event control

- View event details
- Edit event details
- Publish or pause event
- Change normal event status
- Approve readiness with warnings
- Prepare event cancellation
- Archive event

#### Team and access

- View event team
- View team contact details
- Invite event members
- Assign existing event roles
- Remove event members
- Manage shifts and responsibilities

#### Programme

- View programme
- Manage sessions and activities
- Manage tracks
- Manage speakers and moderators
- Publish programme changes
- Manage session registration

#### Operations

- View all event tasks
- Create and assign tasks
- Update all tasks
- Update own assigned tasks
- Manage checklist templates for the event
- View run of show
- Manage run of show
- Update assigned run-of-show status
- Send operational announcements

#### Places, vendors, and resources

- View venue and rooms
- Manage venue and rooms
- View vendors and deliveries
- Manage vendors and deliveries
- View resources
- Manage resources

#### Budget and payments

- View budget totals
- View expense details
- Manage budget and expenses
- Approve planned expenses
- View ticket revenue and provider charges
- View payment details
- Request refund
- Approve refund work
- Record and support refund completion
- Manage payment disputes and reversals

#### Tickets and attendees

- View ticket settings
- Manage ticket types and sales settings
- Manage event purchase terms, refund policy, privacy notice, and consent settings
- View orders and tickets
- Manage attendee records and CSV imports
- Correct attendee information
- Manage ticket delivery, resend, and QR replacement
- Cancel tickets or orders
- Issue organizer-approved free tickets
- View basic attendee information
- View private attendee needs
- Export attendee information
- Perform check-in
- Prepare an offline check-in device
- Undo check-in
- Resolve offline check-in conflicts
- Manage free invitations and RSVP

#### Risks and incidents

- View normal risks and incidents
- Create and manage risks and backup plans
- Report incident
- Assign and manage normal incidents
- View sensitive incidents
- Manage sensitive incidents

#### AI and memory

- Use planning agent
- Use action agent for allowed records
- Approve high-impact AI actions within existing permissions
- Create and manage automatic-action rules within existing permissions
- View automatic-action rules and action history
- Pause automatic AI actions for an event
- View event memory
- Manage event memory
- Propose organization memory

#### Reports and history

- View event dashboard
- View event reports
- Export operational reports
- View event activity history
- Export event activity history

Event permissions only provide access inside one event. They cannot provide organization billing, organization ownership, organization-member management, or access to another event.

Attachments, notes, and comments follow the permission of their parent record. For example, a user who cannot view a vendor cannot view that vendor's contract, and a user who cannot update a task cannot replace its attachment. No separate file permission can be used to bypass access to the related record.

### 4.8 Custom event roles

Custom event roles are allowed in the MVP because event teams use different job names and need different access.

Examples include:

- Check-in Operator
- Finance Officer
- Programme Coordinator
- Vendor Coordinator
- Equipment Manager
- Incident Manager
- AV Coordinator

A custom role includes:

- Role name
- Description
- Selected permissions from the event permission catalogue
- Optional team or operational-area limit
- Optional location limit
- Whether it can be assigned to an external event member
- Creator and last editor
- Creation and update time

Custom-role rules:

1. Only Organization Owners, Organization Admins, and the Event Owner can create, change, or remove a custom event role.
2. An Event Manager can assign an existing custom role but cannot change its permission definition.
3. A person cannot create or assign access beyond their own authority.
4. Only an Organization Owner, Organization Admin, or Event Owner can assign a custom role containing private attendee, payment-view, sensitive-incident, or attendee-export permissions.
5. Only an Organization Owner or Event Owner can assign a custom role containing the Approve Refund Work permission. An Organization Admin cannot assign this permission to themselves or another person without one of those owners approving it.
6. A custom role cannot contain organization-level permissions.
7. A custom role cannot become or replace the Event Owner role.
8. Event ownership, event-cancellation approval, event deletion, and custom-role management cannot be added to a custom role.
9. The MVP does not support custom denial rules. A permission is either included or not included.
10. Each person receives one role per event. When a special combination is needed, an authorized user creates one custom role containing that combination.
11. Changing a custom role changes access for every active member using it. The platform must show the affected people before applying the change.
12. A custom role cannot be removed while people are assigned to it. They must first be moved to another role or removed from the event.

### 4.9 Team, area, location, and time limits

Team Leader and custom-role access can be limited to one or more teams, operational areas, or locations.

Example:

```text
Person: Abdul
Role: AV Lead
Teams: AV Team
Locations: Main Hall and Workshop Room A
Allowed work: AV tasks, resources, incidents, and run-of-show items
```

The person can only act on records connected to those assigned limits. Event Owner and Event Manager access applies across the event, subject to the fixed restrictions above.

An event membership can also have an access-start and access-end time. Before the start or after the end, the user has no event access. Temporary access ends 24 hours after the event reaches Completed status unless an earlier end time was assigned.

### 4.10 Purchaser and attendee

A purchaser is the person who places an order. An attendee is the person who will use a ticket. The same person may be both, but the product must not assume that they always are.

A purchaser can:

- Select tickets
- Complete an order
- Provide attendee information
- Pay through an approved payment provider
- View the order result
- Receive and access tickets
- Request support under the organizer's policies

An attendee can:

- Receive an assigned ticket
- View the ticket and QR code
- Receive event information
- Be admitted through QR or manual check-in

### 4.11 Vendor contact

An outside provider does not receive platform access merely because a vendor record exists. Organizers manage vendor information internally.

If an outside provider needs platform access during the MVP, they must be invited as an external event member and assigned Team Member, Viewer, or a limited custom event role. They must not see unrelated vendors, the full budget, payment details, attendee information, or parts of the event outside their assigned work unless their approved role expressly allows it.

A full vendor portal is outside the MVP.

### 4.12 Invitations and onboarding

An authorized user invites a person using their email address and assigns the required membership before sending the invitation.

An organization invitation includes:

- Organization name
- Organization role
- Inviter
- Invitation expiry

An event invitation includes:

- Organization name
- Event name
- Event role
- Team, area, or location limits
- Responsibilities
- Access start and end when temporary
- Inviter
- Invitation expiry

Invitation states:

```text
Pending → Accepted
```

An invitation may also be declined, expired, or cancelled.

Invitations expire after seven days. An authorized user can resend or cancel a pending invitation. Resending creates a new seven-day acceptance period and makes the previous invitation link unusable.

If the invited person already has an Event Dynamics account, they sign in and accept or decline. If they do not have an account, they verify the invited email address, create their password, accept the platform terms, and then accept or decline.

An invitation can only be accepted by an account that has verified the invited email address. Forwarding the invitation does not give another person access.

Access begins after acceptance or at the assigned access-start time, whichever is later.

### 4.13 Role assignment and access changes

An Organization Owner or Organization Admin assigns organization roles. Only an Organization Owner can assign or remove the Organization Owner role.

An Event Owner or Event Manager assigns fixed and existing custom event roles. An Event Manager cannot assign Event Owner, change custom-role definitions, or grant Event Owner-only permissions.

Before an important role or access change, the platform must show:

- Existing role and access
- New role and access
- Private or financial access being gained or lost
- Unfinished work that may lose an owner

Every membership, role, permission, scope, invitation, suspension, and access-period change must appear in the activity history.

### 4.14 Removing or suspending access

Removing an event member ends access to that event but does not close the person's user account or remove access to other allowed events.

Suspending an organization member ends their access to that organization and all events owned by it. It does not remove access to unrelated organizations.

Removal, suspension, or access expiry must:

- End access promptly
- Preserve past activity, completed work, comments, and approvals
- Identify unfinished tasks, shifts, incidents, and approvals needing reassignment
- Warn the responsible manager about work that no longer has an owner

Historical actions must not be deleted when a person loses access.

### 4.15 Final access rules

The following rules decide who can access what:

1. A suspended or closed user cannot access the affected organization or events.
2. A pending, expired, declined, or cancelled invitation provides no access.
3. An Organization Owner has Event Owner-level access to every event owned by the organization.
4. An Organization Admin has Event Manager-level access to every organization event but does not gain Event Owner-only approvals.
5. An Organization Member receives event access only through an accepted event membership, except when creating a new event.
6. An external event member receives access only to the invited event.
7. A user's event role, team, area, location, and access period together determine their event access.
8. Event access never grants organization billing, organization ownership, access to another event, or company-wide administration.
9. The action agent has no unlimited independent authority. It acts only with the permissions of the user who gives the instruction, approves the action, or creates an active automatic-action rule. An automatic rule cannot grant more access than its authorizing user possesses.
10. The planning agent can describe options outside a user's authority but cannot expose information the user cannot view or pass unauthorized actions to the action agent.
11. Manual screens and AI agents must enforce the same access decisions.
12. AI cannot be used to bypass a missing permission.
13. When a person has organization-wide access and an event role, the wider valid organization access applies, while Event Owner-only approvals remain restricted as stated above.

### 4.16 Public and automatic system actions

Some product interactions do not use an organization or event-team role.

#### Public visitor, purchaser, and attendee actions

An unauthenticated visitor can only:

- View an event page that has been published for the public
- View public programme, speaker, venue, and ticket information selected by the organizer
- Begin a free or paid ticket order while sales are open
- Read public purchase terms, refund policy, and privacy information

A purchaser or attendee using a valid secure link can only:

- View the related order or ticket information
- Complete allowed attendee details
- Assign attendees to tickets when enabled
- Download a ticket and QR code
- Accept or decline a free invitation
- View payment, cancellation, or refund status relevant to that order

A secure order, invitation, or ticket link does not provide access to the organizer workspace or any unrelated order, ticket, attendee, or event information.

#### Automatic system actions

The platform may perform the following actions automatically under approved product rules rather than a human role:

- Expire ticket holds, checkout sessions, invitations, and temporary event access
- Receive and confirm payment states from Monime
- Issue the correct tickets after trusted payment or free-order confirmation
- Mark a ticket type sold out when its limit is reached
- Prevent sales above the approved event limit
- Send order, ticket, invitation, reminder, change, and operational notifications
- Sync offline check-ins and flag conflicts
- Recalculate dashboards, budget totals, attendance totals, and readiness results
- Flag clashes, missing owners, shortages, overdue work, payment reversals, and delivery failures
- Apply the approved data-retention rules
- Record all automatic actions in activity history

Automatic actions do not receive permission to approve refunds, cancel events, make safety decisions, change roles, expose private information, or perform an action reserved for a human approver.

### 4.17 First-time Organization Owner onboarding

First-time onboarding takes a new Organization Owner from account creation to the first event workspace. It must be short, resumable, and usable by an owner who chooses either AI assistance or manual operation.

The onboarding sequence is:

1. Create an account.
2. Verify the email address.
3. Create the organization.
4. Explain Organization Owner access and responsibilities.
5. Accept or decline the organization's AI agreement.
6. Accept or decline optional Event Dynamics customer emails.
7. Select the Free Pilot Event, One-Event Pass, Organizer Plan, or Operations Plan.
8. Choose AI-led planning, manual event creation, or platform exploration.
9. Create or begin the first event.
10. Enter the first event workspace and readiness view.

Required account information is the owner's full name, work email address, password, country, and acceptance of the platform terms and privacy notice. After verification, the owner creates the organization using:

- Organization name
- Organization type
- Country
- City
- Time zone
- Default currency
- Estimated events per year
- Typical event size
- Optional logo, phone number, and website

The country may supply suggested time-zone and currency values, but the owner must confirm them.

The platform must explain that the Organization Owner controls organization ownership, billing, payment connections, organization settings, organization membership, and the organization's use of AI. It must also explain that organization ownership and event roles are different, that there must always be at least one Organization Owner, and that members only receive their assigned access.

#### 4.17.1 Required AI agreement

No agent may perform AI work for an organization until an Organization Owner actively enables AI for that organization. The choice must not be selected in advance.

Before requesting the decision, Event Dynamics must explain in plain language that its agents may, within the organization's permissions and settings:

- Use information supplied by authorized organization and event users
- Use approved organization preferences and relevant past-event information
- Learn from corrections, approvals, rejections, and completed events
- Remember useful information for later events
- Research, plan, coordinate, monitor, and recommend work
- Examine relationships across the connected event plan
- Create or update platform records after the required authorization
- Perform specifically approved background actions when no user is currently using the platform

The owner must be able to review the applicable AI and data terms and then choose **Enable AI** or **Continue without AI**.

If the owner continues without AI:

- Planning, Action, Readiness, Event-day, and Review Agent features remain unavailable.
- No background AI monitoring or AI use of organization memory occurs.
- Normal manual platform features remain available according to the selected plan and user permissions.
- The Organization Owner may enable AI later from organization settings.

The system must record the organization, decision, owner, date and time, agreement version, accepted permissions, and every later change. A material change to the agreement requires the Organization Owner to review and accept the new version before the newly covered AI use begins.

Enabling AI does not give the Action Agent unlimited authority. The owner must choose an initial action mode:

1. **Recommend only:** agents may research, explain, and prepare proposals but may not create or update event records.
2. **Ask before acting:** the Action Agent prepares changes and an authorized user approves them before they are applied. This is the recommended and preselected action mode after AI is enabled.
3. **Selected automatic actions:** the Action Agent may perform only the exact background actions separately authorized through active automatic-action rules.

The owner can change the action mode later. Changing the mode must not approve a pending proposal or silently create an automatic-action rule.

#### 4.17.2 Optional Event Dynamics customer emails

During onboarding, Event Dynamics may ask the Organization Owner whether the organization wants to receive optional product updates, onboarding help, offers, research requests, and customer education emails from Event Dynamics.

This must be separate from:

- Acceptance of platform terms
- Acceptance of the privacy notice
- The organization's AI agreement
- Event attendee marketing consent
- Operational emails required to run the platform

The choice must not be selected in advance. The owner must be able to choose **Receive customer emails** or **Do not receive customer emails**.

If the owner opts out, Event Dynamics may still send necessary service emails such as account verification, password reset, plan billing, security alerts, event team invitations, payment-related notices, and legally required notices.

The organization must be able to change this choice later from organization settings. The system must record the organization, decision, owner, date and time, consent version, and every later change.

#### 4.17.3 Plan selection

Onboarding must present all four available starting choices rather than forcing the Free Pilot Event:

- Free Pilot Event
- One-Event Pass
- Organizer Plan
- Operations Plan

Each choice must show its current complete price, event and attendee limits, team limit, included AI allowance, access period or renewal period, ticketing inclusion, and the fact that Event Dynamics does not charge an MVP ticket fee. The Free Pilot must be shown as an optional plan with no payment method required and no automatic paid renewal.

An owner who selects a paid option completes payment before paid-plan access begins. Event Dynamics plan payment is separate from the Monime connection used for attendee ticket payments. The selected plan and billing action must follow Section 6.13.

#### 4.17.4 Starting the first event

After plan selection, the owner may:

- Begin AI-led event discovery when AI is enabled
- Create the event manually
- Explore the platform before creating an event

AI must not be forced. Owners who declined AI must be directed to manual creation or exploration. Optional team invitations, Monime connection, ticket setup, and detailed organization preferences may be skipped and completed when they become relevant. Monime is only required before paid tickets are published.

The Free Pilot's 60-day access period begins when the owner confirms creation of the pilot event, not when the account or organization is created. The owner must see the pilot limits and expiry behavior before activation.

Onboarding progress must be saved so the owner can leave, resume, and edit earlier answers. Onboarding is complete when the account is verified, the organization exists, required organization settings are confirmed, a plan is selected, and the owner reaches the first event workspace or deliberately chooses platform exploration. It does not require team invitations, a Monime connection, or a completed event plan.

---

## 5. Event lifecycle

An event moves through these states:

```text
Draft
  → Planning
  → Ready
  → Setup
  → Live
  → Closing
  → Completed
```

An event may also be marked as cancelled.

### State meanings

- **Draft:** Basic information is being collected.
- **Planning:** The event plan is being built and confirmed.
- **Ready:** Required planning checks have passed.
- **Setup:** Physical setup or delivery work has started.
- **Live:** Guests are present and the event is running.
- **Closing:** Breakdown, returns, and venue handover are in progress.
- **Completed:** Event work has been closed.
- **Cancelled:** The event will not continue.

The platform must not mark an event as ready only because the organizer selected the status. It should show unresolved readiness problems and ask for confirmation when serious items remain.

---

## 6. Core product areas

### 6.1 Event overview

The event overview is the main record for an event.

It includes:

- Event name
- Description
- Event type
- Purpose and desired results
- Start and end date
- Time zone
- Expected attendance
- Maximum event capacity
- Event status
- Main organizer
- Event team
- Venue and address
- Budget limit
- Important restrictions
- General notes
- Files

The platform should keep these attendance figures separate:

- Maximum capacity
- Expected attendance
- Confirmed attendance
- Actual attendance

#### Example

```text
Event: Tech Conference
Type: Conference
Date: November 15
Venue: Bintumani Conference Center
Expected attendance: 500
Maximum capacity: 650
Status: Planning
Budget limit: $15,000
```

---

### 6.2 Event team and roles

The team area answers: who is responsible?

Each team member includes:

- Name
- Email and phone
- Role
- Team or department
- Responsibilities
- Shift times
- Assigned location
- Assigned tasks
- Availability
- Current work state
- Permissions
- Notes

Basic team states:

```text
Invited → Confirmed → Checked in → On duty → Off duty
```

Other possible states are unavailable and cancelled.

The platform should warn about:

- Responsibilities without an owner
- Unfilled roles
- Overlapping shifts
- One person assigned to different locations at the same time
- Important work assigned to an unavailable person

Roles, permissions, custom roles, invitations, and access limits follow the complete rules in Section 4. The team area must show each member's effective role, team or area limits, access period, invitation state, and current work state. Financial, private contact, attendee, safety, and incident information must only be shown to roles with the matching permission.

---

### 6.3 Programme

The programme area contains sessions, public activities, tracks, and speakers.

The public agenda is generated from sessions and other public activities. It is a view of the programme, not a separate copy of the data.

The programme should be viewable by:

- Time
- Day
- Room
- Track
- Speaker
- Status

#### Sessions

A session includes:

- Title
- Description
- Session type
- Start and end time
- Room or location
- Track
- Capacity
- Speaker or speakers
- Moderator
- Status
- Public visibility
- Materials and attachments
- Requirements
- Related internal schedule items

Basic session types include:

- Keynote
- Panel
- Workshop
- Breakout session
- Networking
- Ceremony
- Question and answer session
- Presentation
- Break
- Meal

Basic session states:

```text
Draft → Confirmed → Ready → Live → Completed
```

A session may also be delayed or cancelled.

The platform should warn about:

- Room clashes
- Speaker clashes
- Moderator clashes
- Capacity problems
- Sessions outside venue access times
- Missing preparation time
- Missing required resources

#### Tracks

A track is a simple way to group sessions by subject or audience.

It includes:

- Name
- Description
- Color
- Sessions

Tracks will remain a small feature in the MVP.

#### Speakers

The MVP speaker record includes:

- Name
- Photo
- Short biography
- Organization
- Job title
- Contact information
- Assigned sessions
- Status
- General requirements
- Basic travel and accommodation notes

The MVP will not include a full speaker application, review, contract, payment, travel booking, or hotel booking system.

---

### 6.4 Tasks and checklists

Tasks and checklists are a central part of the MVP.

Each task includes:

- Title
- Description
- Owner
- Team
- Due date and time
- Priority
- Status
- Location
- Related session, vendor, resource, room, or schedule item
- Checklist or smaller tasks
- Attachments
- Notes and comments
- Blocking reason
- Work that must happen first
- Work that depends on this task
- Created by a person or AI

Task states:

```text
To do → In progress → Completed
```

A task may also be blocked or cancelled.

Priorities:

- Low
- Normal
- High
- Critical

The platform should provide reusable checklist templates. The AI may select a suitable template and change it based on the event brief.

Example templates:

- Conference setup
- Workshop setup
- Festival setup
- Registration area setup
- Venue closing

---

### 6.5 Internal schedule and run of show

The run of show is the private working schedule used to operate the event. It is different from the public programme.

It covers:

- Delivery
- Setup
- Staff arrival
- Team briefings
- Sound checks
- Rehearsals
- Guest entry
- Public sessions
- Room changes
- Breaks
- Event closing
- Breakdown
- Returns
- Venue handover

Each run-of-show item includes:

- Title
- Start and end time
- Actual start and end time
- Location
- Responsible person
- Team
- Description and instructions
- Status
- Related public session
- Related tasks
- Required resources
- Related vendor
- Notes and attachments
- Visibility

States:

```text
Not started → Ready → In progress → Completed
```

An item may also be delayed, blocked, skipped, or cancelled.

The run of show must be shared with approved team members. Each person should have a view showing the information relevant to their role.

The platform should show:

- What is happening now
- What happens next
- Late activities
- Blocked activities
- Work without an owner
- Activities affected by an open incident

---

### 6.6 Venue and rooms

The MVP manages a selected venue. It does not help organizers search for or book venues.

The venue record includes:

- Name
- Address
- Capacity
- Contact person
- Contact details
- Booking status
- Team access times
- Guest access times
- Setup and cleanup times
- Notes
- Attachments
- Basic floor-plan upload

Venue booking states:

```text
Proposed → Reserved → Confirmed
```

A venue may also be unavailable or cancelled.

Each room or area includes:

- Name
- Capacity
- Location within the venue
- Available times
- Basic included equipment
- Access notes
- Setup notes
- Assigned sessions
- Assigned internal schedule items

The MVP will not include venue discovery, online venue booking, advanced seating design, or 3D floor plans.

---

### 6.7 Vendors and deliveries

The MVP manages providers that the organizer has already selected. It does not include a supplier marketplace.

Vendor examples include:

- Food providers
- Decorators
- Sound and screen providers
- Photographers
- Security providers
- Transport providers
- Equipment rental companies
- Printing companies

Each vendor includes:

- Company name
- Service
- Main contact
- Phone and email
- Assigned event
- Agreed work
- Cost
- Deposit amount and state
- Balance and payment state
- Status
- Notes
- Contract or agreement attachment
- Related tasks
- Related resources
- Related deliveries

Vendor states:

```text
Suggested → Contacted → Confirmed → Completed
```

A vendor may also be at risk or cancelled.

Each delivery includes:

- Vendor
- Items and quantity
- Expected arrival
- Actual arrival
- Delivery entrance or location
- Receiving person
- Status
- Related tasks and schedule items
- Notes

Delivery states:

```text
Expected → On the way → Arrived → Checked → Moved to location
```

A delivery may also be late, incomplete, missing, rejected, or returned.

---

### 6.8 Resources and equipment

This area tracks important physical items needed for the event.

Examples include:

- Chairs
- Tables
- Projectors
- Microphones
- Sound speakers
- Tents
- Generators
- Vehicles
- Laptops
- Radios
- Signs
- ID badges

Each resource includes:

- Name
- Type
- Quantity needed
- Quantity confirmed
- Quantity delivered
- Supplier or source
- Required date and time
- Location
- Responsible person
- Status
- Sessions using it
- Tasks using it
- Return requirement
- Cost
- Notes

Resource states:

```text
Requested → Confirmed → In transit → Delivered → Checked → In use → Returned
```

A resource may also be short, missing, damaged, or cancelled.

The platform should warn when:

- Confirmed quantity is below required quantity
- The same resource is assigned to overlapping activities
- A delivery arrives after the resource is needed
- A required resource has no responsible person

The MVP will not include a full warehouse system.

---

### 6.9 Budget and expenses

The MVP provides simple event budget control. It is not a full accounting system.

The budget area includes:

- Total event budget
- Budget categories
- Planned expenses
- Approved expenses
- Actual paid amount
- Unpaid committed amount
- Remaining available amount
- Attachments such as invoices and receipts

Each expense includes:

- Description
- Category
- Planned amount
- Actual amount
- Vendor
- Related task, session, or resource
- Due date
- Payment status
- Approval status
- Notes and attachments

Payment states:

```text
Not due → Deposit due → Partly paid → Paid
```

An expense may also be overdue or cancelled.

The main totals are:

```text
Total budget
Paid amount
Unpaid committed amount
Total committed amount
Available amount
```

The planning agent should consider the budget when proposing an event plan or responding to a change.

---

### 6.10 Ticketing, attendees, and admission

Ticketing covers the complete journey from publishing ticket types to admitting an attendee at the event. It must connect ticket demand and actual attendance to logistics planning.

#### 6.10.1 Approved money model

The MVP launch market is Sierra Leone. Monime is the approved launch payment provider, and paid ticket sales will use Sierra Leonean leones (SLE).

Ticket revenue will be paid into the organizer's connected Monime business Space. The organizer controls settlement from that Space to their own settlement account. Event Dynamics will not receive ticket revenue and later pay it out to the organizer during the MVP.

Event Dynamics will not automatically deduct a per-ticket platform fee during the MVP. Event Dynamics access charges, event passes, subscriptions, and AI top-ups will be billed to the organizer separately from attendee ticket orders, as defined in Section 6.13.

Before paid tickets can be sold, an Organization Owner must connect a Monime business Space that has completed Monime's required account checks. The Event Owner, Event Manager, or a custom role with Manage Ticket Types and Sales Settings permission can then configure and publish paid ticket sales. Free ticket registration remains available without a payment account.

Monime-hosted checkout will provide the payment methods enabled for the organizer's Space, including supported mobile-money, bank, card, and wallet methods. Other payment providers are outside the first release.

Event Dynamics will use a payment-provider-hosted checkout or the provider's secure payment form. Event Dynamics will not collect or store raw card details, mobile-money security codes, bank passwords, or one-time payment passwords.

#### 6.10.2 Ticket types

A user with Manage Ticket Types and Sales Settings permission can create free and paid ticket types.

Each ticket type includes:

- Name
- Description
- Price
- Event currency
- Total quantity available
- Sale start and end
- Status
- Maximum quantity per order
- Valid event day or days
- Included sessions where applicable
- Allowed entry area where applicable
- Admission rule: one entry only or re-entry allowed
- Public benefits description

Ticket type states:

```text
Draft → Scheduled → On sale → Sales ended
```

A ticket type may also be paused, sold out, hidden, or cancelled.

One event will use one selling currency in the MVP. Different currencies within the same event are not supported.

Ticket benefits may be shown as descriptive text. The MVP will only enforce these access rules:

- Event day or days for which the ticket is valid
- Entry area or gate where relevant
- Included sessions where session registration is enabled
- Whether the ticket allows one entry or allows re-entry

Reserved seats, seat maps, meal bundles, merchandise bundles, and complex benefit packages are outside the MVP.

#### 6.10.3 Event and ticket capacity

The system must protect both ticket-type quantities and the overall event sales limit.

The organizer will set:

- Maximum event capacity
- Overall ticket sales limit
- Quantity available for each ticket type

The system will warn when the total quantities across ticket types exceed the event capacity or overall sales limit. The event owner or event manager may approve a higher combined ticket-type quantity when they intentionally expect some types not to sell out, but completed sales must never exceed the approved overall sales limit.

Ticket availability must account for:

- Tickets temporarily held during checkout
- Tickets sold
- Tickets cancelled without returned stock
- Tickets returned to stock after an approved cancellation or refund

The organizer may choose whether a cancelled or refunded ticket returns to available stock while ticket sales remain open. The default will be to return it to stock.

#### 6.10.4 Ticket holds during checkout

When a purchaser begins checkout, the selected ticket quantity will be held for 15 minutes. Held tickets are not available to another purchaser during that time.

The checkout page must clearly show the remaining hold time.

The hold will end when:

- Payment succeeds
- A free order is confirmed
- The purchaser cancels checkout
- The 15-minute period ends

If a payment is still being processed when the hold period ends, the order will remain under payment review. The system will not knowingly oversell the ticket type or event. If payment later succeeds and capacity is no longer available, no usable ticket will be issued. The platform will automatically create urgent refund work and alert the Event Owner; the authorized organizer will complete the refund through their Monime account.

#### 6.10.5 Purchaser and attendee information

The purchaser places the order. Each issued ticket belongs to an attendee.

Purchaser information required for every order:

- Full name
- Email address
- Phone number
- Country where needed for payment
- Acceptance of purchase terms and privacy notice

Basic attendee information:

- Full name
- Email address where required
- Phone number where required
- Ticket type
- Food requirements
- Access requirements
- Emergency or special handling notes with restricted access

A user with Manage Ticket Types and Sales Settings permission can choose whether attendee names are required before payment or may be completed after purchase. Purchaser information is always required.

When attendee information may be completed later:

- Each ticket is issued in an unassigned state until a name is provided.
- The purchaser receives a secure way to assign attendees.
- The organizer may set an assignment deadline.
- An unassigned ticket remains valid only if the organizer allows unnamed admission.

The purchaser and attendee may be the same person. One purchaser may buy tickets for several attendees.

Attendee information may be corrected before check-in. The system must keep a history of important identity changes. Ticket transfer between unrelated people is outside the MVP; an organizer-authorized name correction is not treated as a transfer.

Guest records may also be imported by CSV. Imported guests must be checked for duplicate email, phone, or organizer-provided reference where possible. Staff must review uncertain matches rather than having the system silently combine people.

For a free invitation event, a user with Manage Free Invitations and RSVP permission can import or add invited guests and send each person a free invitation. The invitee can accept or decline. Acceptance creates and assigns a free ticket only while capacity remains available. Users with this permission can see invited, accepted, declined, and unanswered totals. Paid invitation-only sales, private access codes, and approval-based applications are outside the MVP.

#### 6.10.6 Orders

An order represents one purchase and can contain one or more tickets.

An order includes:

- Order number
- Event
- Purchaser
- Ticket types and quantities
- Price of each item at the time of purchase
- Subtotal
- Final total
- Event currency
- Order status
- Creation and completion time
- Terms accepted at purchase

Changing a ticket type's price later must not change an existing order.

Order states:

```text
Draft → Awaiting payment → Confirmed → Completed
```

An order may also be expired, cancelled, partly refunded, or refunded.

A free order follows the same ordering process but does not create a payment attempt:

```text
Create free order → Confirm order → Issue tickets
```

The MVP will not allow free and paid tickets in the same order. The purchaser must complete separate orders.

#### 6.10.7 Fees and price display

The attendee must see the complete amount before confirming payment.

The attendee will pay the displayed ticket price. The organizer is responsible for setting a ticket price that includes any tax that applies to the sale. The MVP will not add a separate tax calculation or Event Dynamics service fee during checkout.

Monime processing charges will be handled under the organizer's Monime agreement and deducted or settled by Monime. Event Dynamics will display confirmed provider charges in organizer reports when Monime returns that information.

The order must retain the exact ticket price and total accepted by the purchaser. Later price changes only apply to new orders.

#### 6.10.8 Payments

Each paid order may have more than one payment attempt. Only one successful payment is required to confirm the order.

Each payment attempt includes:

- Provider
- Provider transaction reference
- Amount
- Currency
- Status
- Payment method category when returned by the provider
- Creation time
- Confirmation time
- Failure or expiry reason when available

Payment states:

```text
Created → Pending → Processing → Successful
```

A payment may also be failed, expired, cancelled, or reversed.

Event Dynamics will only mark payment as successful after trusted confirmation from the payment provider and a check that the order reference, amount, and currency are correct. Returning the purchaser to an Event Dynamics confirmation page is not sufficient proof of payment.

The product must safely handle delayed or repeated provider messages. The same successful payment must never create the same tickets more than once.

If the purchaser is charged more than once for the same order, the extra successful payment must be flagged immediately for refund and staff review.

An order with a pending payment will show clear instructions and may be checked again. No usable paid ticket is issued while payment remains pending, failed, expired, or under review.

#### 6.10.9 Ticket issuance

Tickets are issued only after:

- Trusted payment confirmation for a paid order, or
- Successful confirmation of a free order

Each ticket includes:

- Unique ticket number
- Event
- Order
- Ticket type
- Assigned attendee where provided
- Status
- Valid event day or days
- Access rules
- QR code
- Issue time

Ticket states:

```text
Unassigned or Issued → Checked in
```

A ticket may also be cancelled, refund pending, refunded, replaced, or voided.

A cancelled, refund-pending, refunded, replaced, or voided ticket cannot be used for admission.

#### 6.10.10 QR code protection and replacement

Each ticket receives a unique QR code. The QR code must not expose the attendee's name, email, phone number, ticket price, or payment information.

The QR code is valid only for its assigned event and access rules.

A user with Manage Ticket Delivery, Resend, and QR Replacement permission can replace a ticket when its QR code is believed to be copied, exposed, or lost. Replacing a ticket makes the old QR code unusable, creates a new QR code, sends the replacement to the approved recipient, and records the reason and responsible staff member.

#### 6.10.11 Ticket delivery

After an order is confirmed:

- The purchaser sees a confirmation page.
- The purchaser can access all tickets in the order.
- A confirmation email is sent.
- Each assigned attendee may receive their ticket when the organizer enables direct attendee delivery.
- The email includes a secure way to view or download the ticket and QR code.

Ticket delivery states:

```text
Preparing → Sent
```

Where delivery information is available, the state may also be delivered, failed, or resent.

A user with Manage Ticket Delivery, Resend, and QR Replacement permission can:

- Correct an email address
- Resend a ticket
- Copy a secure ticket link
- Download a ticket
- View failed deliveries

Email is the only required delivery channel for the MVP. SMS, WhatsApp, and digital wallet passes are outside the MVP.

#### 6.10.12 Ticket cancellation

A user with Cancel Tickets or Orders permission can cancel:

- One ticket
- Selected tickets in an order
- An entire order

Cancellation and refund are related but separate actions. A ticket may be cancelled without a refund when the organizer's agreed policy allows it.

Before cancellation, the product must show:

- Tickets affected
- Admission effect
- Refund effect
- Inventory effect
- People who will be notified

Checked-in tickets cannot be cancelled through the normal flow. An event owner or event manager must first reverse the check-in with a reason, after which the cancellation can be reviewed.

#### 6.10.13 Refunds

The MVP supports:

- Full-order refunds
- Refunds for selected tickets

Open custom-value refunds that do not match selected tickets are outside the MVP.

Each refund record includes:

- Order and payment
- Tickets affected
- Refund amount
- Refund reason
- Requested by
- Approved by
- Provider reference
- Status
- Request and completion time
- Failure reason when applicable

Refund states:

```text
Requested → Approved → Refund required → Completed
```

A refund may also need attention, fail, or be cancelled before completion.

When a ticket refund is approved, the ticket becomes unusable immediately and enters refund-pending status.

During the MVP, Event Dynamics will not move money out of the organizer's Monime Space. The authorized organizer will complete the actual refund from their Monime account, then record the Monime transaction reference and completion result in Event Dynamics. Where Monime returns a usable refund or payment-reversal state, Event Dynamics will use it to confirm the recorded result.

The organizer must see the ticket amount, affected tickets, and any known non-refundable provider charge before approving a refund. Event Dynamics has no per-ticket platform fee to refund during the MVP.

Refunds that still require organizer action or cannot be confirmed remain visible until resolved. A failed refund must not silently return the related ticket to a usable state.

#### 6.10.14 Payment reversals and disputes

Event Dynamics must record a payment reversal, dispute, or fraud notice returned by Monime after a payment was previously marked successful.

When this happens, the system will:

- Mark the payment as needing attention or reversed, based on the provider result
- Show the affected order and tickets
- Alert the event owner and approved financial users
- Prevent unused affected tickets from being admitted while the case is reviewed
- Preserve tickets that were already checked in as part of the history and flag the order for review
- Update ticketing and revenue reports
- Record the organizer's resolution and provider reference

The organizer will handle the financial case through their Monime account. Event Dynamics will track the case but will not decide whether a payment dispute is valid.

#### 6.10.15 Event cancellation

Cancelling an event is a controlled action available only to the Event Owner. An Event Manager may prepare the cancellation plan but cannot give final approval.

The cancellation process is:

1. Stop new ticket sales immediately.
2. Stop or expire unpaid orders where possible.
3. Calculate affected orders, tickets, fees, and expected refund amount.
4. Show the cancellation and refund plan.
5. Require final human approval.
6. Make all affected tickets unusable.
7. Create the approved refund work list for the organizer.
8. Notify purchasers and assigned attendees.
9. Track organizer-completed Monime refunds, references, progress, and failures.
10. Update the event and logistics plan.

The AI may prepare the cancellation plan, create refund work items, and draft communications. It may not give final event-cancellation approval, claim that money was refunded, or mark a refund complete without an authorized organizer and a Monime transaction reference or provider-confirmed result.

#### 6.10.16 Check-in

The organizer will have a phone-friendly check-in interface for QR scanning and manual search.

A scan must identify:

- Valid ticket
- Already checked-in ticket
- Cancelled ticket
- Refund-pending or refunded ticket
- Replaced or voided ticket
- Wrong event
- Wrong day or entry area
- Invalid or fake code
- Ticket needing staff review
- Valid re-entry where the ticket type allows it

After a successful check-in, the system records:

- Ticket
- Attendee
- Event
- Check-in time
- Staff member
- Device
- Entry location when configured
- Admission type: first entry or re-entry
- Online or offline mode

The current admission state must be supported by a complete check-in history. The system must not rely only on a single checked-in yes-or-no field.

#### 6.10.17 Offline check-in

Approved devices can prepare for offline check-in before the event by securely receiving the event's ticket validation information.

While offline, staff with Perform Check-in permission using an approved event device can:

- Scan prepared event tickets
- See the locally known ticket result
- Check in valid tickets
- Record the time, device, operator, and entry location

When a connection returns, the device will send its offline check-ins to the platform.

If two offline devices admit the same ticket, the system will:

- Preserve both check-in records
- Mark the case as an offline check-in conflict
- Alert the event manager
- Show the time, device, operator, and location for each entry
- Require or support a manager resolution
- Keep the full history

Example:

```text
08:41 - Gate A device scans Ticket 1042 while offline and admits the attendee.
08:44 - Gate B device also scans Ticket 1042 while offline and admits the attendee.
09:10 - Both devices reconnect.
09:10 - The platform discovers that the same one-entry ticket was admitted twice.
```

This can happen because, while offline, Gate B does not yet know that Gate A already admitted the ticket. The system must not delete one record or pretend only one admission happened. It must preserve both records and make the conflict visible for manager review.

Manager resolution may include:

- Confirming the second admission was allowed because the ticket type permits re-entry
- Marking one admission as an operator mistake
- Marking the case as suspected ticket sharing or misuse
- Adding an internal note
- Keeping both entries for history and reporting

The check-in screen must tell staff clearly when the device is offline and when its latest changes have not yet been sent.

Only approved staff and approved devices can download offline ticket information. Locally held event information must expire or be removed after the approved event period.

#### 6.10.18 Manual check-in and check-in correction

Staff with the Perform Check-in permission can find a ticket by:

- Attendee name
- Purchaser name
- Email address
- Phone number
- Order number
- Ticket number

Manual check-in performs the same validation as QR scanning and records that the check-in was manual.

The Event Owner, Event Manager, or a custom role with the Undo Check-in permission can undo an incorrect check-in. They must provide a reason. The original check-in and correction remain in the activity history.

Each ticket type uses **one entry only** by default. A user with Manage Ticket Types and Sales Settings permission may instead enable **re-entry allowed** for that ticket type.

For a one-entry ticket, another scan after successful admission must show that the attendee is already checked in and must not admit the ticket again without an authorized correction.

For a ticket that allows re-entry, another valid scan after the first admission must clearly show **Re-entry allowed**, let authorized check-in staff admit the attendee again, and record the new entry time, staff member, device, and entry location. The complete admission history must preserve the first entry and every later re-entry.

The MVP does not require attendees to be checked out when leaving and does not try to calculate how many admitted attendees are currently inside the venue. An organizer may undo an incorrect admission under the normal permission and history rules.

#### 6.10.19 Attendees registered at the venue

An attendee registered at the venue, commonly called a **walk-in attendee**, is a person who arrives without completing registration or purchasing a ticket beforehand. The organizer must enable registration at the venue for the event before staff can use this flow.

The MVP supports two registration-at-the-venue paths:

- Authorized staff with the Issue Organizer-Approved Free Tickets permission can collect the required attendee information and consent, create an organizer-approved free ticket, and identify the ticket as registered at the venue. Staff with the Perform Check-in permission can then admit the attendee.
- Any event team member may direct a person who must pay at the venue to the normal public checkout. Only staff with the Perform Check-in permission can admit the attendee after payment is confirmed by the approved payment provider.

Registration at the venue must respect the event capacity and the selected ticket type's remaining quantity. It must collect the same required attendee information and consent as advance registration. The attendee record, ticket, staff member, time, and registration source must appear in the activity history and reports. The system must distinguish advance registration from registration completed at the venue.

The MVP will not include a full cash register, card terminal, cash collection, or manually claimed mobile-money payment flow. Staff cannot mark a paid ticket as paid without confirmation from the approved payment provider.

#### 6.10.20 Session registration

An organizer may allow attendees to select sessions included with their ticket.

The MVP supports:

- Session visibility based on ticket type
- Session registration before the event
- Session capacity limits
- Personal session list
- Prevention of overlapping session selections
- Organizer export of session registrations

Session waiting lists, paid session add-ons, and session-level QR check-in are outside the MVP.

#### 6.10.21 Privacy, consent, and communication permission

The checkout must present:

- Purchase terms
- Refund and cancellation policy
- Privacy notice
- Required consent to process the order and ticket
- Separate optional marketing consent

Purchasing a ticket does not automatically provide consent for unrelated marketing.

Access to attendee contact information, food needs, access needs, and special handling notes must be limited by role. Staff should only see what they need for their work.

The product must support:

- Correction of attendee information
- Export of organizer-owned event and attendee data
- Removal or anonymization requests where legally permitted
- A stated data-retention period
- History of important identity, ticket, payment, refund, and check-in changes

The default retention period for attendee profile and attendance information is 24 months after the event ends. After that period, information that is no longer required will be removed or changed so that it no longer identifies the attendee. Order, payment, refund, consent, and financial activity records will be retained for seven years, or longer when the law requires it. An Organization Owner or Organization Admin may shorten attendee-data retention where the law and active refund or dispute needs allow it.

Event Dynamics will provide the product controls needed for organizers to publish their terms and privacy information. Legal wording and organizer policies remain subject to company and market approval before launch.

#### 6.10.22 Ticketing dashboard and reports

Users can see the following information when their role contains the matching ticket, attendee, payment, refund, or report permission:

- Overall sales limit
- Tickets held during checkout
- Tickets sold
- Tickets available
- Sales by ticket type
- Free and paid orders
- Successful revenue
- Known provider fees
- Expected organizer revenue
- Pending and failed payments
- Completed and failed refunds
- Delivery failures
- Checked-in attendees
- Attendance rate
- Offline devices waiting to sync
- Duplicate and offline check-in conflicts

Users with the matching export permission can export:

- Orders
- Tickets
- Attendees
- Payments
- Refunds
- Check-in history
- Session registrations

Financial exports must distinguish successful payments, refunds, fees, and expected organizer revenue.

---

### 6.11 Risks and backup plans

A risk is something that might cause a problem.

Each risk includes:

- Title
- Description
- Area affected
- Chance of happening
- Likely effect
- Importance
- Owner
- Prevention plan
- Backup plan
- Status
- Related tasks, vendors, resources, rooms, or sessions

Example:

```text
Risk: Outdoor lunch affected by rain
Effect: High
Owner: Logistics lead
Prevention: Check forecast 72 and 24 hours before event
Backup: Move lunch to Conference Room B
```

The planning agent should find likely risks and suggest backup plans. An organizer must review important safety and financial decisions.

---

### 6.12 Incidents and live problems

An incident is an unplanned problem that is happening or has happened.

Each incident includes:

- Title
- Description
- Reported time
- Reporter
- Location
- Importance
- Assigned person
- Status
- Related session, task, resource, vendor, or schedule item
- Actions taken
- Resolution time
- Notes and attachments

Incident states:

```text
Open → Assigned → Being handled → Resolved → Closed
```

The live dashboard should highlight open critical and high-priority incidents.

Safety-related incidents must have restricted access and a complete activity history.

---

### 6.13 Revenue model, plans, and billing

Event Dynamics will earn revenue from access to the event-management platform and from additional AI usage. It will not earn revenue by deducting a percentage or fixed Event Dynamics fee from tickets sold during the MVP.

The MVP has one free pilot offer and four paid revenue streams:

1. One-Event Pass
2. Organizer Plan
3. Operations Plan
4. AI top-ups

These are launch offers and launch prices. They make it easier for organizers to try a new platform without a large financial commitment and are not permanent price promises. Event Dynamics may introduce more plans, services, limits, or revenue streams and may increase prices as the platform provides greater value. A price change must be clearly communicated before it takes effect. It must not change an amount already paid for an active Event Pass or the current paid period of a subscription.

#### 6.13.1 Free Pilot Event

Each organization may receive one free pilot event. The pilot must provide enough of the real product for an organizer to plan and run an event, test the AI agents, and decide whether Event Dynamics is useful.

The pilot includes:

- One event
- Up to 60 days of access
- Up to 100 attendees
- Up to 5 event team members
- 100 included AI units
- Event planning and logistics features
- Free and paid ticketing
- Attendee check-in
- Standard online support
- No Event Dynamics fee on tickets

The pilot is available once per organization, not once per user. Creating another organization to avoid payment is not permitted. When the pilot reaches its time, attendee, team, or AI limit, the Organization Owner must purchase an Event Pass, begin a subscription, or purchase an allowed AI top-up to continue the affected use.

The system must warn the Organization Owner before the pilot expires. Pilot information must remain available in read-only form for at least 30 days after expiry so the organization has time to upgrade or export its information. Public ticket sales and new AI work must stop when the pilot expires unless the organization upgrades. Valid tickets already issued for an event must remain verifiable and usable through the event's admission period; the platform must not make attendees lose valid tickets because an organizer's plan expired.

#### 6.13.2 One-Event Pass

The One-Event Pass is for an organizer that wants to manage one event without a monthly subscription.

Launch price: **$29 for one event**, charged in a supported billing currency or at the approved local price for the organizer's billing country.

The pass includes:

- One event
- Access beginning up to 90 days before the event and ending 30 days after it
- Up to 500 attendees
- Up to 15 event team members
- 300 included AI units
- Event planning and logistics features
- Free and paid ticketing
- Attendee check-in
- Standard online support
- No Event Dynamics fee on tickets

The pass belongs to one named event and cannot be moved to another event after ticket sales begin or the event becomes Live. If the event date is moved, the paid access period moves with it, subject to fair-use controls. Event Dynamics may require an extension payment where an organizer repeatedly moves an event or extends its planning period beyond the intended pass period.

The system must warn the Organization Owner before the pass ends. After it ends, the same read-only, export, and issued-ticket protections defined for the free pilot apply.

#### 6.13.3 Organizer Plan

The Organizer Plan is for organizations that manage events regularly.

Launch price: **$59 per month**.

The plan includes:

- Up to 5 active events at one time
- Up to 2,500 attendees per event
- Up to 50 event team members per event
- 1,000 included AI units per billing month
- Event planning and logistics features
- Free and paid ticketing
- Attendee check-in
- Standard priority support
- No Event Dynamics fee on tickets

An active event is an event in Draft, Planning, Ready, or Live state that has not been archived. Completed and archived events remain available for permitted viewing and reporting and do not count against the active-event limit.

#### 6.13.4 Operations Plan

The Operations Plan is for event companies and larger organizations coordinating many events, attendees, and team members.

Launch price: **$159 per month**.

The plan includes:

- Up to 20 active events at one time
- Up to 10,000 attendees per event
- Up to 150 event team members per event
- 3,000 included AI units per billing month
- Event planning and logistics features
- Free and paid ticketing
- Attendee check-in
- Priority support
- One guided organization setup session
- No Event Dynamics fee on tickets

Requests beyond these limits require an agreed plan or written quotation. Event Dynamics must not promise enterprise-only services, special security arrangements, or service guarantees unless the company has approved and can deliver them.

#### 6.13.5 AI units and top-ups

AI top-ups are the fourth paid revenue stream. Every paid plan includes an AI allowance. An organization may buy additional AI units without changing plans.

AI units are a simple customer-facing measure of AI work. Customers must not need to understand model names, tokens, or other supplier billing terms. The number of units used must reflect the size and cost of the work. A simple answer or small update should use fewer units than deep research, a complete event plan, or a change review across many connected items.

The system must:

- Show the available included and purchased AI-unit balances.
- Show an estimate before beginning AI work expected to use a significant number of units.
- Record the units used by each completed AI request.
- Return units when work fails because of an Event Dynamics error.
- Use included monthly units before purchased top-up units.
- Reset unused monthly plan units at the end of the billing period.
- Keep purchased top-up units available for at least 12 months from purchase.
- Allow the Organization Owner to purchase top-ups and view AI charges and usage.
- Allow Organization Admins to view usage but not purchase top-ups unless the Organization Owner later grants an approved billing permission.

Manual use of Event Dynamics does not consume AI units. Manually creating or editing records remains available within the organization's plan limits.

One organizer request may cause the Action Agent to update several connected records. The platform must price this as one measured AI job based on the total work, not charge a separate customer fee for every record changed.

Initial top-up pack sizes and prices may be set and adjusted by Event Dynamics before launch after measuring real AI costs. Top-ups must remain affordable, their complete price and unit quantity must be shown before purchase, and a completed purchase must appear in the organization's billing and AI-usage history. The Organization Owner must approve every top-up purchase; AI usage must never create an unapproved automatic charge.

#### 6.13.6 Billing currency and local pricing

The launch prices above are reference prices in United States dollars. In Sierra Leone, Event Dynamics should present and collect a fixed approved price in Sierra Leonean leones where the billing method supports it. The customer must see the complete price before purchase.

Local prices should be reviewed periodically rather than changed every day with the exchange rate. Future regional pricing may consider local purchasing power, payment costs, taxes, currency conditions, and support costs. Regional pricing is determined by the organization's verified billing country, not by the location selected for one event.

Taxes and Event Dynamics payment-collection charges, where legally required, must be shown before the Organization Owner confirms payment. Monime charges connected to attendee ticket payments remain separate from Event Dynamics plan and AI charges.

#### 6.13.7 Plan purchase, renewal, cancellation, and limits

Only the Organization Owner may start, change, renew, or cancel a paid plan, buy an Event Pass, purchase AI top-ups, change billing information, or view complete billing records. All billing actions must be recorded in the organization activity history.

A monthly subscription renews each month until the Organization Owner cancels it. Cancellation stops the next renewal and does not remove access during a period already paid for. Event Dynamics must show the next renewal date and price before confirmation and in billing settings.

The system must warn the Organization Owner as the organization approaches event, attendee, team, time, or AI limits. Reaching a limit must not delete information or invalidate tickets already issued. It may prevent the organization from creating more affected records, starting additional AI work, publishing additional capacity, or activating another event until the organization upgrades or reduces usage safely.

If renewal payment fails, the system must notify the Organization Owner and allow a reasonable payment-recovery period. During that period, existing events and valid tickets remain operational. After the recovery period, the organization becomes read-only except for billing, export, essential event-day admission for already-issued tickets, and other actions needed to protect attendees. The exact recovery period must be stated in the terms shown at purchase.

#### 6.13.8 Price changes and future revenue

Event Dynamics may raise launch prices or add new paid services as the product gains stronger AI abilities, integrations, reporting, communication tools, support services, or other material value.

For any price increase:

- Existing customers must receive advance notice.
- The current paid billing period must keep its original price.
- An active Event Pass must not be repriced.
- The renewal screen must show the new price before the customer is charged.
- The customer must be able to cancel before the new price applies.

Future revenue streams may include paid communication packs, assisted event setup, premium support, and later enterprise agreements. They are not part of the four approved paid MVP revenue streams unless separately approved and added to this brief.

---

## 7. AI-native organizer copilot

AI is part of the product from the first day. It is not an extra chat feature placed beside the main system. It works across the connected event plan.

The user may interact with one assistant even though the system uses different agents for different work.

AI assistance is optional for every normal planning and management activity. Authorized users must also have complete standard screens, menus, forms, and controls for creating, viewing, editing, moving, cancelling, and updating the event information allowed by their role. A user does not need to ask an agent to operate the product.

### Ways organizers work with Event Dynamics

The MVP supports three equal ways of working:

1. **Manual control:** The organizer uses normal navigation and screens to create or update events, sessions, tasks, team assignments, vendors, resources, budgets, tickets, and other allowed records.
2. **Plan and approve:** The organizer explains an idea or change to the planning agent, reviews its research and proposal, and approves selected actions for the action agent to apply.
3. **Direct action request:** The organizer gives the action agent a clear instruction, such as “Change the session called ‘The Future of AI’ to 2:00 PM and move it to the Main Hall.” The action agent checks permission and likely effects, then applies the instruction or requests approval when the change has wider effects.

Manual and agent-created changes must follow the same permissions, validation rules, connected-record checks, and activity history. After a user makes a manual change, the platform should immediately check for conflicts and affected work. It may offer an effect review, but it must not force the user to hand the same change back to the action agent.

### 7.1 Planning agent

The planning agent helps the organizer:

- Turn an event idea into a structured plan
- Research relevant locations, costs, practices, and options
- Show sources for researched facts
- State assumptions clearly
- Suggest a public programme
- Suggest an internal run of show
- Create tasks and checklists
- Suggest team roles
- Suggest vendor and resource needs
- Estimate costs
- Identify missing information
- Identify possible risks
- Adjust plans to match the budget and goals
- Suggest ticket types, quantities, sale periods, and prices for organizer review
- Use ticket demand and attendance information when reviewing logistics needs

The planning agent should create drafts for review instead of silently publishing important information.

#### 7.1.1 Event discovery conversation

For a new event, the Planning Agent begins by understanding the event rather than immediately producing a complete plan. It should ask in plain language about matters such as:

- The event idea and purpose
- The intended audience
- Desired results
- Expected attendance
- Possible date, duration, and location
- Available or expected budget
- Information already decided
- Important unknowns or limits
- Whether an event team already exists and what is known about its roles and responsibilities

The questions must be adapted to what the organizer has already said. The agent may ask follow-up questions while planning or researching when information is missing, unclear, conflicting, or important to a decision. It should not present a long fixed questionnaire or ask for information that is not relevant to the event.

The agent may make reasonable minor assumptions, but it must clearly expose an assumption before relying on it when the assumption could materially change cost, date, venue, capacity, staffing, ticket sales, attendee safety, programme structure, vendor needs, or payment responsibilities. It should explain ongoing findings and important choices to the organizer so that major decisions are not silently built into a finished plan.

#### 7.1.2 Platform-aware planning

The Planning Agent must understand the capabilities, limits, states, permissions, and connections provided by Event Dynamics. It uses this knowledge to recommend only the planning areas useful for the particular event.

Possible areas include:

- Event foundation and goals
- Team and responsibilities
- Programme, sessions, tracks, and speakers
- Tasks and checklists
- Run of Show
- Venue and rooms
- Vendors and deliveries
- Resources and equipment
- Budget and expenses
- Tickets, attendees, and admission
- Risks and backup plans

Not every event needs every area. The agent should infer likely needs from the available context, explain why it recommends an area, and ask the organizer to confirm, remove, add, postpone, or delegate the choice back to the agent. For example, it should not add tracks merely because tracks exist in the platform when a small single-room event does not need them.

#### 7.1.3 Section-based planning workspace

An AI-produced event plan must be a structured, dynamic planning workspace rather than one long document. Only relevant sections are shown. The response and section structure may differ between events according to their needs.

Each planning section may have these states:

```text
Not started
Drafting
Needs information
Ready for review
Approved
Applied to event
Changed after approval
```

Within a section, an authorized user can:

- Read the current proposal and its reasons
- Discuss that section with the Planning Agent
- Ask for research, evidence, alternatives, or cost changes
- Correct information or assumptions
- Approve all or selected parts
- Return an approved section to drafting
- Preview the records and changes that applying it will produce
- Send approved work to the Action Agent

The Planning Agent remains available inside every section. A section conversation must retain the permitted context of the complete event, other planning sections, connected event records, organization preferences, and relevant past events. Section boundaries are for focus and readability; they must not create isolated plans or separate memories.

Applying a section must create or update the correct platform records rather than store the proposal only as descriptive text. For example, applying an approved Programme section may create sessions, tracks, speaker assignments, room assignments, and programme times.

Before a section is applied, the system must perform an effect review across the complete connected event plan. It must show conflicts, dependencies, records that will change, and follow-up work. The organizer may apply safe selected parts, return to planning, or approve related follow-up actions.

Approval and application are separate decisions. Approving a section confirms its proposed content; it does not automatically apply records unless the authorized user has explicitly chosen an automatic-action rule that covers that exact action.

#### 7.1.4 Memory during planning

When organizational AI is enabled, the Planning Agent may use permitted organization memory and relevant past events. It must identify whether information is a current confirmed fact, past-event information, an organization preference, an AI suggestion, or an unconfirmed assumption.

Past behavior may guide a recommendation but must not silently control a new event. For example, the agent may explain that previous events opened registration 90 minutes early and ask whether the organizer wants to follow the same approach.

### 7.2 Change understanding and effect review

An organizer can tell the planning agent that something has changed.

Example:

> We now expect 800 guests instead of 500.

The planning agent will:

1. Understand the requested change.
2. Search the connected event plan.
3. Find records that directly or indirectly rely on the changed information.
4. Check capacity, timing, staffing, resources, vendors, tasks, risks, and budget.
5. Explain the likely effects.
6. Find new conflicts or missing work.
7. Propose a set of changes.
8. Show cost, time, readiness, and communication effects.
9. Wait for the organizer to review the proposal.

Example response:

```text
Requested change
Expected attendance: 500 → 800

Affected areas
- Main Hall capacity is 650
- Catering order covers 500 meals
- Security plan covers 500 guests
- Badge supplies cover 550 guests
- Check-in team may be too small
- Transport plan covers 420 guests

Proposed actions
- Move the opening session to a larger space or split attendance
- Request 300 additional meals
- Add two security staff
- Add three check-in staff
- Order 300 additional badges
- Review transport capacity

Estimated added cost
$4,500–$6,200

Approval required
Yes
```

This effect review is a capability of the planning agent. It does not need to appear as a separate product module.

### 7.3 Action agent

The action agent can act in three ways:

- Apply changes selected from an approved planning-agent proposal
- Carry out a direct instruction from an authorized user
- Perform a specifically permitted background action under an active automatic-action rule

For a direct instruction, the action agent must identify the intended event item even when the user describes it in plain language. If more than one item matches, it must ask the user to select the correct one before making the change.

Low-risk direct changes may be applied immediately and followed by a clear result. Changes affecting cost, capacity, ticket sales, payments, refunds, safety, many people, or several connected parts of the plan must show their effects and require approval first.

It may:

- Update event information
- Create, update, move, or cancel sessions
- Update the public programme
- Create or update internal schedule items
- Create, assign, or reschedule tasks
- Update resource quantities
- Update vendor requirements and delivery records
- Update budget estimates and expenses
- Create new risks
- Draft or send approved team messages
- Notify affected people
- Update readiness results
- Create or update approved ticket types and sales settings
- Pause ticket sales when an approved capacity limit is reached
- Update logistics work after ticket demand changes

The action agent must only perform actions allowed by the user's permission level.

All actions available through the action agent must also remain available through the standard product screens to users who have the required permission.

#### 7.3.1 Automatic-action rules

Background action is allowed only when organizational AI is enabled and an authorized user has created an explicit automatic-action rule. A general AI agreement or general action mode is not enough.

Each rule must state:

- Event or approved organization scope
- Information or condition being monitored
- Trigger
- Exact actions the agent may perform
- Records it may read and change
- Actions it may only propose
- Whether another human approval is required
- Users who must be notified
- Start and end date or another clear stopping condition
- User who authorized the rule

The rule cannot grant more permission than the authorizing user has. It must stop when disabled, expired, the event ends, the authorizing user loses the required permission, organizational AI is disabled, or the organization's plan no longer permits the work.

Automatic actions may include low-risk operational work such as recalculating readiness, creating a risk when a critical task becomes overdue, notifying responsible internal users, detecting shortages, or creating approved follow-up work. A rule may prepare a message, external communication, or higher-risk change without being allowed to send or apply it.

The Organization Owner must have a visible control to pause all automatic AI actions for the organization. Authorized event leaders must be able to pause automatic actions for their event. Pausing must not remove history or pending proposals.

Every automatic action must explain what triggered it, what information it used, what changed, and which rule authorized it. It must notify the people named in the rule and support correction or reversal where practical.

### 7.4 Action safety

Before an important action is applied, the platform should show:

- Requested change
- Assumptions
- Records that will change
- New records that will be created
- Records that will be cancelled or removed
- People who will be notified
- Expected cost change
- New warnings or conflicts
- Actions that cannot be safely completed
Think of like a preview before changes are applied

The organizer should be able to:

- Approve all proposed actions
- Approve selected actions
- Edit a proposal
- Reject a proposal
- Ask for another option

Every AI action must record:

- What changed
- Previous value
- New value
- Reason
- Agent responsible
- Person who requested it
- Person who approved it
- Date and time

Manual user actions must also be included in the same activity history, showing the responsible user instead of an agent.

Actions should be reversible where practical. When a complete undo is not safe or possible, the platform must explain this before acting.

The AI must never make unapproved payments, refunds, event cancellations, or final safety decisions.

It must also never use a general AI agreement as permission to change roles, grant access, connect or replace a payment account, publish or materially change ticket sales, send large external communications, or perform another action that requires a named human approval under this brief.

### 7.5 Readiness agent

The readiness agent checks the event plan and reports:

- Overdue tasks
- Blocked tasks
- Missing owners
- Unfilled roles
- Unconfirmed vendors
- Late deliveries
- Resource shortages
- Room and schedule clashes
- Missing budget approvals
- Open high-priority risks
- Open incidents
- Missing required information
- Ticket sales above a safe logistics limit
- Ticket quantities that conflict with event capacity
- Payments or refunds needing attention
- Ticket delivery failures
- Offline check-in devices that are not prepared

It should explain why an event is or is not ready.

### 7.6 Event-day agent

During setup, live operation, and closing, the event-day agent helps with:

- What is happening now
- What happens next
- Delays
- Blocked work
- Missing people or resources
- Open incidents
- Likely effects on later activities
- Suggested recovery actions
- Messages to affected teams
- Ticket and check-in problems
- Arrival levels that require staffing, room, food, or security changes

High-risk actions still require approval.

### 7.7 Review and learning agent

After an event, the system should compare the plan with what happened.

It can review:

- Planned versus actual times
- Planned versus actual costs
- Late or blocked tasks
- Vendor performance
- Resource shortages
- Common incidents
- Accepted and rejected AI suggestions
- Organizer feedback

It should turn approved lessons into suggestions for future events.

---

## 8. Organizer and company memory

The platform begins building useful memory from the organizer's first day.

Memory types:

### 8.1 Current event memory

Facts, decisions, assumptions, and working information for the current event.

### 8.2 Organizer memory

Preferences and repeated working patterns for one organizer.

Examples:

- Preferred planning style
- Common checklist changes
- Preferred communication tone
- Normal setup times
- Regular suppliers
- Budget preferences
- Recommendations often accepted or rejected

### 8.3 Company memory

Approved information shared across an organization.

Examples:

- Standard checklists
- Approved suppliers
- Cost limits
- Required safety steps
- Preferred venues
- Standard roles
- Lessons from past events

Users must be able to:

- See what is remembered
- Correct it
- Remove it
- Mark it as applying to one event only
- Mark it as an organizer preference
- Approve it as a company rule if permitted

The system must not silently turn one choice into a permanent preference.

---

## 9. Event dashboard

The dashboard brings the logistics plan together. It is built from live event information rather than manually entered totals.

Every dashboard and report must follow the viewer's permissions. A user may only see totals and details from records they are allowed to view. For example, a Team Leader without budget permission cannot see budget totals through a dashboard card, AI summary, export, or notification.

### 9.1 Planning view

Show:

- Event status
- Days until event
- Readiness score and explanation
- Expected attendance and capacity
- Task totals
- Overdue and blocked tasks
- Team coverage
- Vendor confirmation
- Resource shortages
- Budget position
- High-priority risks
- Upcoming deadlines
- Recent changes
- Ticket sales against capacity
- Payment and refund items needing attention

### 9.2 Live view

Show:

- What is happening now
- What happens next
- Activities running late
- Current attendance when available
- Missing staff
- Late deliveries
- Resource shortages
- Open incidents
- Recent announcements
- AI warnings and suggested actions
- Checked-in attendance against expected attendance
- Offline check-in devices waiting to sync
- Admission conflicts needing manager review

### 9.3 Example

```text
EVENT
Tech Summit 2026
Status: Planning
Readiness: 84%

PROGRAMME
18 sessions
3 tracks
12 speakers
4 rooms

OPERATIONS
42 tasks
35 completed
4 overdue
2 blocked

TEAM
14 members
1 unfilled role

VENDORS
9 total
8 confirmed
1 at risk

RESOURCES
27 required
24 confirmed
3 short

TICKETING
327 / 500 tickets sold
291 attendees checked in
2 payment items need attention

BUDGET
$12,000 committed / $15,000 total
$3,000 available

NEXT DEADLINES
Catering confirmation — Tomorrow
Final room plan — November 12
Venue setup — November 14
```

The readiness percentage must be supported by visible checks. It must not be an unexplained AI score.

---

## 10. Activity history and notifications

### 10.1 Activity history

The platform must record important human and AI activity.

Examples:

- Event information changed
- Task assigned or completed
- Session moved
- Vendor confirmed
- Resource quantity changed
- Budget changed
- AI proposal approved
- AI action completed or failed
- Incident opened or resolved
- Order confirmed, expired, cancelled, or refunded
- Payment confirmed, failed, reversed, or found to be duplicated
- Ticket issued, replaced, cancelled, or refunded
- Manual or offline check-in recorded or corrected
- Event cancellation approved and refund work created or completed

### 10.2 Notifications

The MVP should notify users about:

- Assigned work
- Approaching deadlines
- Overdue work
- Blocked work
- Schedule changes
- Role or shift changes
- Vendor and delivery changes
- AI proposals awaiting approval
- Failed AI actions
- Serious incidents
- Important announcements
- Ticket delivery failures
- Payment or refund failures needing staff action
- Offline check-in conflicts
- Ticket sales reaching organizer-set warning levels

Notifications should be sent only to affected people when possible.

The MVP does not need to replace a full team-chat product. Comments, direct operational notices, and announcements are sufficient.

---

## 11. Key connections in the system

The MVP's value depends on connected records.

```text
Event
├── Team members and roles
├── Venue and rooms
├── Sessions, tracks, and speakers
├── Tasks and checklists
├── Run-of-show items
├── Vendors and deliveries
├── Resources and equipment
├── Budget and expenses
├── Guest counts and needs
├── Risks and backup plans
├── Incidents
├── Ticket types and capacity limits
├── Orders, payments, and refunds
├── Tickets and attendees
└── Check-in history
```

Important examples:

- A session uses a room, speakers, resources, tasks, and run-of-show items.
- A vendor provides resources, deliveries, and services and creates expenses.
- A task has an owner and may depend on a vendor, delivery, resource, or earlier task.
- An incident affects a location, activity, task, resource, or vendor.
- A change to attendance may affect rooms, food, staff, resources, risks, and costs.
- A confirmed order creates tickets only after a free-order confirmation or trusted paid-payment confirmation.
- Ticket sales and check-ins update attendance information used by logistics planning.
- A refund makes the affected ticket unusable and updates attendance and financial reports.

The system design must preserve these connections. The AI should work through them rather than searching unrelated text fields alone.

---

## 12. MVP boundaries

### Included in the MVP

- Event setup and status
- AI planning and research
- First-time Organization Owner onboarding with optional plan selection
- Organization-level AI agreement and manual-only use when AI is declined
- Recommend-only, ask-before-acting, and selected automatic-action modes
- Section-based AI event planning and approval
- Controlled background Action Agent rules and organization/event pause controls
- Connected event plan
- Organizer and company memory
- Multi-organization workspaces with isolated organization data
- Fixed organization roles and fixed event roles
- Custom event roles built from the approved event permission catalogue
- Email invitation, account onboarding, access periods, and access removal
- Team, operational-area, and location access limits
- Sessions and public programme
- Simple tracks and speaker profiles
- Tasks, smaller tasks, and reusable checklists
- Shared internal run of show
- Selected venue and basic room management
- Basic vendor and delivery management
- Basic resource and equipment management
- Simple event budget and expense tracking
- Ticket types, quantities, sale periods, and capacity control
- Free and paid orders
- Fifteen-minute checkout holds
- Direct-to-organizer Monime payment model
- One free pilot event per organization
- $29 launch-price One-Event Pass
- $59 monthly launch-price Organizer Plan
- $159 monthly launch-price Operations Plan
- Included AI allowances and separately purchased affordable AI top-ups
- Complete ticket-price display
- Trusted payment confirmation and payment history
- Separate purchaser and attendee records
- Free invitations, acceptance, decline, and unanswered tracking
- Ticket issuance, secure QR codes, delivery, resend, and replacement
- Ticket and order cancellation
- Full-order and selected-ticket refunds
- Payment reversal and dispute tracking
- Controlled event cancellation and refund process
- Phone-friendly online and offline check-in
- Manual ticket search and admission
- Check-in correction and full history
- Basic support for attendees registered at the venue
- Basic session registration
- Ticketing dashboard and exports
- Attendee privacy and communication consent controls
- Risks and backup plans
- Live incident reporting
- AI effect review after an organizer reports a change
- Human review and approval
- Action agent execution
- Activity history
- Operational notifications
- Planning and live dashboards

### Explicitly not included

- Venue marketplace or venue discovery
- Supplier marketplace
- Full speaker application and review system
- Speaker contracts and payments
- Travel and hotel booking
- Advanced floor-plan or seating design
- Staff hiring and payroll
- Full accounting
- Full equipment warehouse management
- Sponsor sales and management
- Exhibitor sales and management
- Marketing campaign management
- General-purpose team chat
- Discount and promotion codes
- Referral and affiliate programmes
- Reserved seats and seat maps
- Ticket resale or secondary marketplace
- Ticket transfers between unrelated people
- Season tickets and subscriptions
- Loyalty programmes
- Digital wallet passes
- More than one currency within an event
- Automatic changing ticket prices
- Complex group purchasing
- Full onsite cash register or payment terminal
- Manually confirmed mobile-money payments
- Advanced tax calculation
- Session waiting lists and paid session add-ons
- Session-level QR check-in
- Attendee check-out and live inside-the-venue occupancy tracking
- Custom organization roles
- More than one event role for the same person in the same event
- Custom permission denial rules
- Google, Microsoft, company single sign-on, passkeys, and phone-number-only login
- Full vendor portal

---

## Approved ticketing product decisions

The following decisions are final for the MVP and should guide engineering delivery:

1. Event Dynamics supports free and paid tickets.
2. One event sells tickets in one currency.
3. The organizer sets ticket-type quantities and an overall sales limit.
4. Tickets selected during checkout are held for 15 minutes.
5. Free and paid tickets cannot be mixed in one order.
6. The purchaser and attendee are separate people in the product, even when the same person fills both roles.
7. Paid tickets are issued only after trusted provider confirmation of the expected amount and currency.
8. Payment retry creates another attempt under the same order rather than another completed order.
9. The same successful payment cannot issue tickets more than once.
10. Ticket revenue goes into the organizer's connected Monime business Space.
11. Event Dynamics does not hold organizer ticket revenue and pay it out later in the MVP.
12. Event Dynamics does not take an automatic per-ticket fee during the MVP; access or subscription charges are billed separately to the organizer.
13. The attendee pays the displayed ticket price, which the organizer sets to include any required tax.
14. Monime processing charges are handled under the organizer's Monime agreement and shown in reports when returned by Monime.
15. Event Dynamics uses Monime-hosted checkout and does not store raw payment credentials.
16. Monime is the only MVP payment provider, Sierra Leone is the launch market, and SLE is the paid-ticket currency.
17. A ticket has a unique QR code that does not expose personal or payment information.
18. Email and a secure confirmation page are the MVP ticket-delivery methods.
19. Organizers can correct delivery addresses, resend tickets, and replace exposed or lost QR codes.
20. The MVP supports full-order refunds and refunds for selected tickets; the authorized organizer completes the actual money refund through their Monime account and records its reference in Event Dynamics.
21. A refund-pending ticket becomes unusable as soon as the refund is approved and remains unusable if the refund requires attention or fails.
22. Cancelling a ticket and refunding payment are separate controlled actions.
23. Cancelling an event stops sales first and requires human approval before tickets are disabled and refund work is created.
24. The AI can explain and prepare ticketing actions but cannot finally approve payments, refunds, or event cancellation.
25. Check-in supports QR scanning and manual ticket search.
26. Approved devices support offline check-in.
27. Offline duplicate-entry conflicts are preserved, shown, and resolved through manager review.
28. Authorized managers can undo an incorrect check-in with a required reason.
29. The MVP supports free attendees registered at the venue and sends paid attendees registering at the venue through normal online checkout.
30. Ticket types use one-entry admission by default, but organizers can allow simple re-entry. Every entry is recorded; attendee check-out and live inside-the-venue occupancy tracking are outside the MVP.
31. Basic session registration can be limited by ticket type and session capacity.
32. Marketing permission is optional and separate from order-processing consent.
33. Ticket sales and check-in data are part of event logistics planning and readiness.
34. All important ticket, payment, refund, delivery, and check-in actions are included in the activity history.
35. Free invitation events support imported invitees, acceptance, decline, unanswered tracking, and capacity-protected free-ticket issuance.
36. Payment reversals, disputes, and fraud notices returned by Monime are shown to authorized users and can stop an unused affected ticket from being admitted.
37. Attendee profile and attendance information is retained for 24 months by default; financial, consent, and payment activity is retained for seven years or longer when required by law.

These decisions complete the product scope needed for engineering to begin system design. Engineering remains responsible for choosing the architecture, data structures, services, security controls, and implementation approach that meet these requirements.
