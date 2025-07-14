# Features
## Subscription
- [ ] Allow user to cancel subscription (update sub with 'cancel_at_period_end: true') 
- [x] Stop user from going to checkout session of the same subscription they already have
- [x] Update subscription when the user upgrades or downgrades
- [x] Control chatbot usage based on subscription's message count
- [ ] Deactivate chatbots (add field to DB) when subscription status is canceled (warn user at cancel moment).
- [ ] Reset chatbot currentPeriodMessagesCount on subscription renewal

## Dashboard
- [ ] Show some graphics
- [ ] Manage chatbots (activate/deactivate, styles, context data, etc)
- [ ] Use offset to improve performance when we have thousands of messages.

# Tasks
- [ ] Create user on DB with clerk webhook
- [x] Use React.Suspense to show skeleton on server component pages that make queries to the db.
- [ ] Show message to unauthenticated users instead of redirecting to /
- [ ] Polish the status of the chatbot (active, inactive, canceled, etc)
- [ ] Allow user to edit the business info after testing the chatbot
- [x] Properly manage wizardId in localStorage after chatbot creation
- [ ] Remove chatbot config from form wizard

# Tech debt
- [ ] Improve error handling
- [x] Move createChatbotTransaction logic to separate functions and pass transaction as argument (see subscription transaction)

# Business
- [ ] Polish what's included on every plan
- [ ] Define chatbot and message quantity
- [ ] Define prices