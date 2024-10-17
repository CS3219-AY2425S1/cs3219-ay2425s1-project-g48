[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)

# CS3219 Project (PeerPrep) - AY2425S1

## Group: G48

### Note:

- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice.
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements.

### Quick start guide

#### Run app with docker

- Read the guides of the backend services and frontend services to setup the .env file.
- For each service, copy the .env.sample file and rename it to .env
- For the `user` and `question` service, update the `MONGODB_CLOUD_URI` with ur mongodb atlas uri if you are using `PROD` mode.
- To start the app, `cd` to the backend folder and run the command `docker compose up`.
- To stop the app, run the command `docker compose down`.
