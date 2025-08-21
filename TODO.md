# Features
## Subscription
- [x] Allow user to cancel subscription (update sub with 'cancel_at_period_end: true') 
- [x] Stop user from going to checkout session of the same subscription they already have
- [x] Update subscription when the user upgrades or downgrades
- [x] Control chatbot usage based on subscription's message count
- [x] Deactivate chatbots (add field to DB) when subscription status is canceled (warn user at cancel moment).
- [x] Reset chatbot currentPeriodMessagesCount on subscription renewal

## Dashboard
- [x] Show some graphics
- [x] Manage chatbots (activate/deactivate, styles, context data, etc)
- [x] Use offset to improve performance when we have thousands of messages.

# Tasks
- [x] Create user on DB with clerk webhook
- [x] Use React.Suspense to show skeleton on server component pages that make queries to the db.
- [ ] Show message to unauthenticated users instead of redirecting to /
- [ ] Polish the status of the chatbot (active, inactive, canceled, etc)
- [ ] Allow user to edit the business info after testing the chatbot (make dashboard route, show business info on cards)
- [x] Properly manage wizardId in localStorage after chatbot creation
- [x] Remove chatbot config from form wizard
- [x] Check when user downgrades from pro to basic and has more than allowed chatbots
- [ ] Validate files quantity and file size before uploading to uploadThing

# Tech debt
- [ ] Improve error handling
- [x] Move createChatbotTransaction logic to separate functions and pass transaction as argument (see subscription transaction)

# Business
- [ ] Polish what's included on every plan
- [ ] Define chatbot and message quantity
- [ ] Define prices