## Generals pending task
- [ ] Improve performance of format calculations upon new structure data coming from the back end
- [ ] Improve Interface structure in Home.vue
- [ ] Check an strategy to auto import route.ts files into the router
- [ ] Check how to improve aliasing strategy for paths
- [ ] Try to purge https://markus.oberlehner.net/blog/setting-up-tailwind-css-with-vue/

- [ ] Changes elements for ACTUAL Chips

## Notes
Deployment:
https://dev.to/marwan01/deploy-a-vue-js-app-to-heroku-30m

In order to properly use the Review Apps in heroku for the Vue deployments, as it needs
a buildpack that is mention in the previous link, an app.json file is needed specifying 
all the configuration rules

https://devcenter.heroku.com/articles/app-json-schema#buildpacks

### JSPdf
It seems that JSPdf automatically changes width and height values according to landscape or portrait mode
