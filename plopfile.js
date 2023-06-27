module.exports = function (plop) {
  // create service generator
  plop.setGenerator("service", {
    description: "Create a new service",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the service?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/services/{{camelCase name}}/{{camelCase name}}.ts",
        templateFile: "plop-templates/service.hbs",
      },
      {
        type: "add",
        path: "src/services/{{camelCase name}}/{{camelCase name}}.types.ts",
        templateFile: "plop-templates/serviceTypes.hbs",
      },
      {
        type: "add",
        path: "src/services/{{camelCase name}}/index.ts",
        templateFile: "plop-templates/serviceIndex.hbs",
      },
    ],
  });
};
