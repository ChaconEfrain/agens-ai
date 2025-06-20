# Features
## Subscription
- [ ] Allow user to cancel subscription (update sub with 'cancel_at_period_end: true') 
- [x] Stop user from going to checkout session of the same subscription they already have
- [x] Update subscription when the user upgrades or downgrades
- [x] Control chatbot usage based on subscription's message count
- [ ] In checkout.session.completed event check if the user already has a subscription in the DB (canceled) and update record
- [ ] Deactivate chatbots (add field to DB) when subscription status is canceled (warn user at cancel moment).

## Dashboard
- [ ] Show some graphics
- [ ] Manage chatbots (activate/deactivate, styles, context data, etc)

# Tasks
- [x] Use React.Suspense to show skeleton on server component pages that make queries to the db.
- [ ] Show message to unauthenticated users instead of redirecting to /
- [ ] Polish the status of the chatbot (active, inactive, canceled, etc)
- [ ] Allow user to edit the business info after testing the chatbot
- [ ] Properly manage wizardId in localStorage after chatbot creation
- [x] Right now a business can have multiple chatbots, that's wrong, it should only have one chatbot.

# Tech debt
- [ ] Improve error handling
- [x] Move createChatbotTransaction logic to separate functions and pass transaction as argument (see subscription transaction)