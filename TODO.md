# Features
## Subscription
[ ] Allow user to cancel subscription
[ ] Stop user from going to checkout session of the same subscription they already have
[ ] Update subscription when the user upgrades or downgrades
[ ] Control chatbot usage based on subscription's message count
[ ] In checkout.session.completed event check if the user already has a subscription in the DB (canceled) and update record

# Tech debt
[ ] Improve error handling
[ ] Move createChatbotTransaction logic to separate functions and pass transaction as argument (see subscription transaction)