# Features
## Subscription
- [ ] Allow user to cancel subscription
- [x] Stop user from going to checkout session of the same subscription they already have
- [x] Update subscription when the user upgrades or downgrades
- [x] Control chatbot usage based on subscription's message count
- [ ] In checkout.session.completed event check if the user already has a subscription in the DB (canceled) and update record

# Tasks
- [ ] Use React.Suspense to show skeleton on server component pages that make queries to the db.

# Bugs
- [ ] A user can go to /embed/[slug] page and it's public, this needs restriction

# Tech debt
- [ ] Improve error handling
- [ ] Move createChatbotTransaction logic to separate functions and pass transaction as argument (see subscription transaction)