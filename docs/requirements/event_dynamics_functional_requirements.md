# FUNCTIONAL REQUIREMENTS: EVENT DYNAMICS

## 1. Account, Organization, And Onboarding

All capabilities are subject to the product brief's organization and event access rules, including inherited organization authority, assigned scope, custom roles, and access periods. This document does not introduce additional permissions or roles.

1. Users shall be able to create an account.
2. Users shall be able to verify their email address.
3. Users shall be able to sign in and sign out.
4. Users shall be able to sign out from all devices at once.
5. Users shall be able to reset a forgotten password.
6. Users shall be able to update their own profile.
7. Users shall be able to set their preferred operating time zone.
8. Verified users shall be able to create an organization and become its first Organization Owner.
9. Users shall be able to belong to more than one organization.
10. Users shall be able to switch between organizations they belong to.
11. Organization Owners and Organization Admins shall be able to update organization details within their role limits.
12. Organization Owners shall be able to complete first-time organization onboarding.
13. Organization Owners shall be able to resume unfinished onboarding.
14. Organization Owners shall be able to enable or disable organizational AI and manage acceptance of its agreement.
15. Organization Owners shall be able to choose the organization's AI action mode.
16. Organization Owners shall be able to accept or decline optional Event Dynamics customer emails.
17. Organization Owners shall be able to select a Free Pilot Event, One-Event Pass, Organizer Plan, or Operations Plan.
18. Organization Owners shall be able to begin with AI-led event creation, manual event creation, or platform exploration.
19. Organization Owners and Organization Admins shall be able to manage organization data-retention settings within their role limits.
20. Organization Owners shall be able to suspend organization membership and access within the organization.
21. Organization Owners shall be able to recover ownership of an event that has no active Event Owner.
22. Organization Owners shall be able to delete their organization within the allowed product and safety limits.

## 2. Organization Members, Roles, And Access

23. Public visitors shall be able to view published public event pages, schedules, speakers, and ticket options without creating an account.
24. Public visitors shall be able to view public event purchase terms, refund policies, and privacy notices.
25. Organization Owners shall be able to invite organization members.
26. Organization Owners and Organization Admins shall be able to assign organization roles within their authority.
27. Organization Owners shall be able to remove, suspend, and reactivate organization members.
28. Organization Admins shall be able to invite Organization Admins and Organization Members.
29. Organization Admins shall be able to remove, suspend, and reactivate Organization Admins and Organization Members.
30. Organization members shall be able to view the organization member directory.
31. The system must always keep at least one active Organization Owner.
32. Users with the required permission shall be able to invite people to a specific event within their event authority.
33. Users with the required permission shall be able to invite external event members without making them organization members.
34. Invited users shall be able to accept or decline invitations.
35. The system must automatically expire pending member invitations after seven days.
36. Organization Owners, Organization Admins, Event Owners, Event Managers, and users with the required permission shall be able to resend or cancel organization or event invitations within their authority.
37. Event Owners, Event Managers, and users with the required permission shall be able to assign fixed or existing custom event roles within their authority.
38. Organization Owners, Organization Admins, and Event Owners shall be able to create custom event roles.
39. Organization Owners, Organization Admins, and Event Owners shall be able to update custom event roles.
40. Organization Owners, Organization Admins, and Event Owners shall be able to remove custom event roles.
41. Organization Owners, Organization Admins, Event Owners, and users with the required permission shall be able to limit event access by team, area, location, assigned work, and time period.
42. Organization Owners, Organization Admins, Event Owners, and users with the required permission shall be able to assign access-start and access-end timestamps to temporary event members.
43. The system must enforce temporary event-access periods.
44. The system must preview the effect of important access changes before applying them.
45. Event Owners, Event Managers, Organization Owners, Organization Admins, and users with the required permission shall be able to remove or suspend event access within their authority.
46. The system must preserve the history of actions performed by removed or suspended users.

## 3. Event Foundation

47. Organization Owners, Organization Admins, and Organization Members shall be able to create events where their organization role permits it.
48. Event members shall be able to view events according to their event role and scope.
49. Event Owners, Event Managers, and roles with Edit Event Details permission shall be able to edit event details.
50. Organization Owners and Event Owners shall be able to assign or transfer the Event Owner.
51. Event Owners, Event Managers, and roles with Change Event Status permission shall be able to manage event status from draft to completion.
52. Event Owners, Event Managers, and roles with Archive Event permission shall be able to archive completed events.
53. Event Owners and Organization Owners shall be able to give final approval for event cancellation.
54. Event Owners, Event Managers, and users with the required permission shall be able to prepare an event cancellation proposal.
55. Event Owners, Event Managers, and roles with Edit Event Details permission shall be able to manage event attendance targets and capacity.
56. The system must separately track and display Maximum Capacity, Expected Attendance, Confirmed Attendance, and Actual Attendance.
57. Users shall be able to manage event files, notes, and supporting documents according to the permissions of the parent record.
58. Event Owners, Event Managers, and users with the required permission shall be able to publish and pause events.
59. Event Owners, Event Managers, and users with the required permission shall be able to approve event readiness with warnings.
60. The system must connect event records so changes can be reviewed across affected areas.

## 4. Event Team And Responsibilities

61. Event Owners, Event Managers, and roles with View Team permission shall be able to view the event team list.
62. Event Owners, Event Managers, Team Leaders, and roles with Manage Responsibilities permission shall be able to assign event responsibilities within their scope.
63. Event Owners, Event Managers, and roles with Manage Team permission shall be able to assign event team members to teams or work areas.
64. Event Owners, Event Managers, Team Leaders, and roles with Manage Shifts permission shall be able to manage team member shifts within their scope.
65. Event Owners, Event Managers, Team Leaders, and roles with Manage Availability permission shall be able to manage team member availability within their scope.
66. Event Owners, Event Managers, Team Leaders, and roles with Manage Team Status permission shall be able to track team members across distinct work states.
67. Event team members shall be able to view their assigned work.
68. Event team members with permission to update assigned work shall be able to update their own work status.
69. The system must warn about unassigned responsibilities.
70. The system must warn about overlapping shifts or location conflicts.

## 5. Programme, Sessions, Tracks, And Speakers

71. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to create sessions.
72. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to update sessions.
73. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to cancel sessions.
74. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to assign sessions to rooms or locations.
75. Event Owners, Event Managers, and roles with Manage Speakers permission shall be able to assign speakers and moderators to sessions.
76. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to manage session materials and attachments.
77. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to manage session capacity.
78. Event Owners, Event Managers, and roles with Manage Sessions permission shall be able to manage session status.
79. Event Owners, Event Managers, and roles with Manage Tracks permission shall be able to create and manage tracks.
80. Event Owners, Event Managers, and roles with Manage Tracks permission shall be able to assign sessions to tracks.
81. Event Owners, Event Managers, and roles with Manage Speakers permission shall be able to manage speaker profiles.
82. Event Owners, Event Managers, and roles with Manage Speakers permission shall be able to manage speaker requirements.
83. Event Owners, Event Managers, and roles with Publish Programme Changes permission shall be able to publish the public agenda.
84. Event members with View Programme permission shall be able to filter and view the programme by time, day, room, track, speaker, and status.
85. Event Owners, Event Managers, and roles with Manage Sessions or Manage Run of Show permission shall be able to link public sessions to internal Run of Show items.
86. Event Owners, Event Managers, and roles with Manage Tracks permission shall be able to assign distinctive colors to tracks.
87. The system must warn about session time, room, speaker, moderator, and capacity conflicts.

## 6. Tasks, Checklists, And Run Of Show

88. Event Owners, Event Managers, Team Leaders, and roles with Create Tasks permission shall be able to create tasks within their scope.
89. Event Owners, Event Managers, Team Leaders, assigned Team Members, and roles with Update Tasks permission shall be able to update tasks within their scope.
90. Event Owners, Event Managers, Team Leaders, and roles with Assign Tasks permission shall be able to assign tasks within their scope.
91. Event Owners, Event Managers, Team Leaders, and roles with Manage Tasks permission shall be able to manage task due dates, priorities, and statuses within their scope.
92. Event Owners, Event Managers, Team Leaders, and roles with Manage Checklists permission shall be able to add subtasks and checklist items.
93. Event Owners, Event Managers, Team Leaders, assigned Team Members, and roles with Update Tasks permission shall be able to add task notes, comments, files, and related records within their scope.
94. Event Owners, Event Managers, Team Leaders, and users with the required task-management permission shall be able to define predecessor and successor dependencies between tasks.
95. Organization Owners, Organization Admins, Event Owners, and users with the required permission shall be able to create and manage reusable checklist templates.
96. Event Owners, Event Managers, and roles with Manage Checklists permission shall be able to apply reusable checklist templates to events.
97. Event Owners, Event Managers, and roles with Manage Run of Show permission shall be able to create Run of Show items.
98. Event Owners, Event Managers, Team Leaders, and roles with Update Run of Show permission shall be able to update Run of Show items within their scope.
99. Event Owners, Event Managers, and roles with Manage Run of Show permission shall be able to assign owners to Run of Show items.
100. Event Owners, Event Managers, Team Leaders, and roles with Update Run of Show permission shall be able to track planned and actual times in the Run of Show within their scope.
101. Event Owners, Event Managers, and roles with Manage Run of Show permission shall be able to link Run of Show items to related sessions, tasks, vendors, and required resources.
102. Event team members shall be able to view what is happening now and what happens next according to their role and scope.
103. Event Owners, Event Managers, Team Leaders, and roles with Send Announcements permission shall be able to broadcast operational announcements to specific teams or operational areas.
104. The system must warn about overdue, blocked, ownerless, and delayed work.

## 7. Venue, Rooms, Vendors, Resources, And Budget

105. Event Owners, Event Managers, and roles with Manage Venue and Rooms permission shall be able to record the selected venue.
106. Event Owners, Event Managers, and roles with Manage Venue and Rooms permission shall be able to manage rooms and event areas.
107. Event Owners, Event Managers, and roles with Manage Sessions or Manage Venue and Rooms permission shall be able to assign sessions and activities to rooms.
108. Event Owners, Event Managers, and roles with Manage Venue and Rooms permission shall be able to manage venue access, setup, and cleanup times.
109. Event Owners, Event Managers, and roles with Manage Venue and Rooms permission shall be able to upload basic venue floor-plan documents.
110. Event Owners, Event Managers, and roles with Manage Vendors permission shall be able to manage vendor records.
111. Event Owners, Event Managers, and roles with Manage Vendors permission shall be able to manage vendor commitments.
112. Event Owners, Event Managers, and roles with Manage Vendors or Manage Budget permission shall be able to manage vendor costs, deposits, balances, and payment status.
113. Event Owners, Event Managers, and roles with Manage Vendors permission shall be able to manage vendor deliveries.
114. Event Owners, Event Managers, and roles with Manage Vendor Deliveries permission shall be able to record delivery entrance, receiving person, and inspection status.
115. Event Owners, Event Managers, and roles with Manage Resources permission shall be able to manage required resources and equipment.
116. Event Owners, Event Managers, and roles with Manage Resources permission shall be able to assign resources to sessions, locations, tasks, or Run of Show items.
117. Event Owners, Event Managers, Team Leaders, and roles with Manage Resources permission shall be able to track confirmed, delivered, returned, missing, and damaged resources within their scope.
118. Event Owners, Event Managers, and roles with Manage Resources permission shall be able to track resource return requirements for items that must be returned after the event.
119. Event Owners, Event Managers, and roles with Manage Budget and Expenses permission shall be able to manage event budgets.
120. Event Owners, Event Managers, and roles with Manage Budget and Expenses permission shall be able to manage expense categories.
121. Event Owners, Event Managers, and roles with Manage Budget and Expenses permission shall be able to manage planned, approved, paid, and unpaid expenses.
122. Event Owners, Event Managers, and users with the required permission shall be able to approve planned expenses.
123. Event Owners, Event Managers, and roles with Manage Budget and Expenses permission shall be able to attach invoices and receipts to expenses.
124. The system must calculate total budget, committed amount, paid amount, unpaid amount, and available amount.
125. The system must warn about venue, delivery, resource, and budget conflicts.

## 8. Tickets, Orders, Payments, And Attendees

126. Organization Owners shall be able to connect the organization's Monime business Space.
127. Organization Owners shall be able to replace or disconnect the organization's Monime business Space.
128. Event Owners, Event Managers, and roles with Manage Ticket Types and Sales Settings permission shall be able to create ticket types.
129. Event Owners, Event Managers, and roles with Manage Ticket Types and Sales Settings permission shall be able to update ticket types.
130. Event Owners, Event Managers, and roles with Manage Ticket Types and Sales Settings permission shall be able to publish, pause, close, or end ticket types.
131. Event Owners, Event Managers, and roles with Manage Ticket Types and Sales Settings permission shall be able to set ticket quantities, prices, sale periods, limits, visibility, and admission rules.
132. Purchasers shall be able to select tickets.
133. Purchasers shall be able to place free ticket orders.
134. Purchasers shall be able to place paid ticket orders through Monime-hosted checkout.
135. Purchasers shall be able to provide purchaser and attendee information.
136. Purchasers shall be able to assign attendee names after purchase when the organizer allows later assignment.
137. Event Owners, Event Managers, and roles with Manage Ticket Types and Sales Settings permission shall be able to configure whether unassigned tickets can be admitted at the venue.
138. Purchasers shall be able to accept event terms, refund policy, privacy notice, and required processing consent.
139. Event Owners, Event Managers, and users with the required permission shall be able to manage event purchase terms, refund policies, privacy notices, and consent settings.
140. Purchasers and attendees shall be able to give or decline optional attendee marketing consent.
141. Purchasers shall be able to access their order and tickets through secure links.
142. Attendees shall be able to view and download their assigned tickets and QR codes through secure access.
143. The system must hold selected tickets during checkout.
144. The system must prevent ticket sales above approved limits.
145. The system must prevent free tickets and paid tickets from being purchased in the same order.
146. The system must display all-inclusive ticket prices without hidden fees or separate MVP service fees added at checkout.
147. The system must confirm paid orders only after trusted Monime payment confirmation.
148. The system must detect multiple successful charges on the same order and flag duplicate payments for staff review and refund work.
149. Purchasers shall be able to retry payment and recheck pending payment status.
150. The system must confirm free orders without requiring payment.
151. The system must issue tickets only after successful free-order confirmation or trusted paid-payment confirmation.
152. The system must generate secure QR codes for issued tickets.
153. The system must deliver tickets by email and secure ticket access pages.
154. Event Owners, Event Managers, and roles with Correct Attendee Information permission shall be able to correct attendee information.
155. Event Owners, Event Managers, and roles with Manage Ticket Delivery permission shall be able to resend tickets.
156. Event Owners, Event Managers, and roles with Manage QR Replacement permission shall be able to replace exposed or lost QR codes.
157. Event Owners, Event Managers, and roles with Manage Attendees and CSV Import permission shall be able to import guests by CSV.
158. Event Owners, Event Managers, and roles with Manage RSVP permission shall be able to manage free invitations and RSVP.
159. Invitees shall be able to accept or decline free event invitations.
160. Event Owners, Event Managers, and roles with Cancel Tickets or Orders permission shall be able to cancel tickets or orders.
161. Event Owners, Event Managers, and roles with Cancel Tickets or Orders permission shall be able to cancel a ticket without issuing a refund when organizer policy allows.
162. The system must require an approved check-in undo before a checked-in ticket can be cancelled.
163. Event Owners, Event Managers, and roles with Request Refund permission shall be able to manage refund requests.
164. Event Owners, Event Managers, and roles with Request Refund permission shall be able to prepare full-order refunds and selected-ticket refunds.
165. Event Owners and custom roles with owner-approved Approve Refund Work permission shall be able to approve refund work.
166. Event Owners, Event Managers, and roles with Record Refund Completion permission shall be able to record organizer-completed Monime refund references.
167. Event Owners, Event Managers, and roles with Manage Disputes permission shall be able to manage payment reversals, disputes, and fraud notices.
168. The system must automatically prevent unused affected tickets from being admitted when a Monime dispute, reversal, or fraud notice is received.
169. Event Owners and Organization Owners shall be able to carry out event cancellation within their authority.
170. Event Owners, Event Managers, and roles with Export Attendee or Financial Records permission shall be able to export permitted attendee, order, ticket, payment, and refund records.
171. The system must apply the organization's permitted data-retention policies.
172. The product must support attendee-data removal or anonymization requests where permitted.

## 9. Admission And Event-Day Check-In

173. Staff with Perform Check-in permission shall be able to check in attendees by scanning QR codes.
174. Staff with Perform Check-in permission shall be able to check in attendees by manual search.
175. Staff with Perform Check-in permission shall be able to see clear admission results.
176. Staff with Perform Check-in permission shall be able to admit valid first entries.
177. Staff with Perform Check-in permission shall be able to admit valid re-entries when the ticket type allows re-entry.
178. The system must maintain complete timestamped admission history for each ticket instead of relying on a single check-in flag.
179. Event Owners, Event Managers, and roles with Undo Check-in permission shall be able to undo incorrect check-ins.
180. Event Owners, Event Managers, and roles with Prepare Offline Check-in Device permission shall be able to prepare approved devices for offline check-in.
181. Staff with Perform Check-in permission using an approved prepared device shall be able to check in attendees while offline.
182. The system must sync offline check-ins when the device reconnects.
183. The system must expire locally held offline ticket validation data after the approved event period.
184. The system must flag offline duplicate-entry conflicts.
185. Event Owners, Event Managers, and roles with Resolve Offline Check-in Conflicts permission shall be able to resolve offline duplicate-entry conflicts.
186. Staff with Issue Organizer-Approved Free Tickets permission shall be able to register approved walk-in attendees at the venue.
187. Staff with Issue Organizer-Approved Free Tickets permission shall be able to issue organizer-approved free tickets at the venue.
188. Event Owners, Event Managers, and users with the required permission shall be able to enable or disable registration at the venue.
189. The system must distinguish advance registrations from venue walk-in registrations in reports and dashboards.
190. Attendees shall be able to register for eligible sessions before the event.
191. The system must prevent attendees from selecting overlapping sessions during session registration.
192. Event Owners, Event Managers, and users with the required permission shall be able to manage attendee session registration settings.
193. Attendees shall be able to view their personal session lists.
194. Event Owners, Event Managers, and roles with Export Session Registration Records permission shall be able to export session registration records.

## 10. Risks, Incidents, Dashboards, And Notifications

195. Event Owners, Event Managers, and roles with Manage Risks permission shall be able to create risks.
196. Event Owners, Event Managers, and roles with Manage Risks permission shall be able to update risks.
197. Event Owners, Event Managers, and roles with Manage Backup Plans permission shall be able to create backup plans.
198. Event team members with incident-reporting permission shall be able to report incidents within their event access scope.
199. Users authorized to manage sensitive incidents shall be able to mark safety-related incidents as sensitive.
200. Event Owners, Event Managers, Team Leaders, and roles with Manage Incidents permission shall be able to update normal incidents within their scope.
201. Event Owners, Event Managers, Team Leaders, and roles with Manage Incidents permission shall be able to resolve normal incidents within their scope.
202. Users with View Dashboard permission shall be able to view a planning dashboard.
203. Users with View Dashboard permission shall be able to view a live event dashboard.
204. Users with View Ticketing Dashboard permission shall be able to view ticketing dashboard information.
205. Users with View Readiness Information permission shall be able to view readiness information.
206. Users with View Reports permission shall be able to view reports.
207. Users with Export Reports permission shall be able to export reports.
208. The system must restrict dashboard cards, metrics, report data, exports, notifications, and AI summaries to information permitted by the user's role and scope.
209. Users shall be able to receive operational notifications relevant to their role, assignments, and permitted records.
210. Event Owners, Event Managers, and roles with Send Announcements permission shall be able to send event announcements.
211. Users with View Activity History permission shall be able to view activity history.
212. Users with Export Activity History permission shall be able to export activity history.

## 11. AI Planning, Action, Readiness, And Memory

213. Users with Use Planning Agent permission shall be able to use the Planning Agent when organizational AI is enabled.
214. The system must provide standard manual UI access for every normal action that AI agents can perform.
215. Users with Use Planning Agent permission shall be able to request event-planning research and review its sources when organizational AI is enabled.
216. Users with Use Planning Agent permission shall be able to create an AI-led event plan.
217. Users with Use Planning Agent permission shall be able to review AI planning sections.
218. The Planning Agent must track planning sections through explicit planning states.
219. Users with Use Planning Agent permission shall be able to discuss a planning section with the Planning Agent.
220. Users with Use Planning Agent permission shall be able to approve or reject AI planning sections within their authority.
221. Users with Use Action Agent permission shall be able to apply approved AI planning sections to event records within their authority.
222. Users with Use Planning Agent permission shall be able to ask the Planning Agent to review the effect of a change.
223. The Action Agent must ask for clarification when a plain-language direct instruction matches more than one event record.
224. Users with Use Action Agent permission shall be able to use the Action Agent for permitted direct instructions.
225. Users with Use Action Agent permission shall be able to review AI action previews before important changes are applied.
226. Users authorized to approve the proposed actions shall be able to approve, edit, or reject AI action proposals within their authority.
227. Event Owners and users with the required permission shall be able to create, view, edit, and end automatic-action rules within their authority.
228. Organization Owners shall be able to pause all automatic AI actions across the organization with a single control.
229. Event Owners, Event Managers, and users with the required permission shall be able to pause automatic AI actions for their event with a single control.
230. The system must record every AI-created proposal and action.
231. The system must record important manual and automatic-system actions.
232. Users shall be able to use the Readiness Agent where organizational AI and their event access permit it.
233. The Readiness Agent must provide an itemized and explainable breakdown of checks and deficiencies.
234. Users shall be able to use the Event-Day Agent where organizational AI and their event access permit it.
235. Users shall be able to use the Review and Learning Agent where organizational AI and their event access permit it.
236. Users with View Event Memory permission shall be able to view event memory.
237. Users with Manage Event Memory permission shall be able to manage event memory.
238. Users shall be able to view organizer memory that belongs to them.
239. Users shall be able to manage organizer memory that belongs to them.
240. Users with the required permission shall be able to propose event or organizer memory for promotion to company memory.
241. Organization Owners, Organization Admins, and users with View Company Memory permission shall be able to view company memory.
242. Organization Owners and Organization Admins shall be able to manage approved company memory.
243. Users shall be able to reverse AI-applied changes where reversal is supported and their authority permits it.

## 12. Plans, Billing, And Usage

244. Organization Owners shall be able to view available Event Dynamics plans.
245. Organization Owners shall be able to activate a Free Pilot Event.
246. Organization Owners shall be able to purchase a One-Event Pass.
247. Organization Owners shall be able to start an Organizer Plan subscription.
248. Organization Owners shall be able to start an Operations Plan subscription.
249. Organization Owners shall be able to renew, change, or cancel paid plans.
250. Organization Owners shall be able to view billing history.
251. Organization Owners shall be able to manage billing information and view upcoming renewal details.
252. Organization Owners shall be able to purchase AI top-ups.
253. Organization Owners shall be able to view AI unit usage.
254. Organization Admins shall be able to view AI unit usage where allowed.
255. Organization Owners and permitted Organization Admins shall be able to view available included and purchased AI-unit balances.
256. The system must provide an AI unit cost estimate before starting operations expected to consume significant AI units.
257. The system must refund consumed AI units when an AI operation fails because of an internal platform error.
258. The system must manage included and purchased AI-unit validity.
259. The system must warn organizations before plan, event, attendee, team, time, or AI limits are reached.
260. The system must enforce plan limits without deleting existing information.
261. The system must keep organization data available in read-only form after a pilot, pass, or plan expires.
262. The system must provide a payment recovery grace period when subscription renewal fails before restricting workspace access.
263. The system must preserve valid issued-ticket admission when an organizer's plan expires.
