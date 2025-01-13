import projectType from "../../project-type/controllers/project-type";

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreController('api::project.project', ({ strapi }) => ({
  // Default behavior for other endpoints is inherited from the core controller

  // Custom logic for the "groupByYear" endpoint
  async groupByYear(ctx) {
    console.log("groupByYear endpoint called");
    try {
      const projects = await strapi.entityService.findMany('api::project.project', {
        fields: ['Name', 'Date', 'ParentVine', 'Hyperlinks', 'Locations', 'VenueInstitute', 'Description', 'Collaborators'],
        populate: {
            Tags: {fields: ['Name']},  
            Type: {fields: ['Type']}, 
            vineImages: true,
            galleryImages: true
          }
      });

      console.log('Generated Query:', projects.query);  // Logs the query Strapi is executing
     // console.log(projects);

      const groupedProjects = projects.reduce((acc, project) => {
        const year = project.Date;
        if (!acc[year]) acc[year] = [];
        acc[year].push(project);
        return acc;
      }, {});

      ctx.send(groupedProjects);
    } catch (error) {
      console.log(error)
      ctx.throw(500, 'Error while grouping projects by year');
    }
  },

  async groupByParent(ctx) {
    console.log("group by parent endpoint called");
    try {
      const projects = await strapi.entityService.findMany('api::project.project', {
        fields: ['Name', 'Date', 'ParentVine', 'Hyperlinks', 'Locations', 'VenueInstitute', 'Description', 'Collaborators'],
        populate: {
            Tags: {fields: ['Name']},  
            Type: {fields: ['Type']}, 
            vineImages: true,
            galleryImages: true
          }
      });

      console.log('Generated Query:', projects.query);  // Logs the query Strapi is executing
     // console.log(projects);

      const groupedProjects = projects.reduce((acc, project) => {
        const parent = project.ParentVine;
        if (!acc[parent]) acc[parent] = [];
        acc[parent].push(project);
        return acc;
      }, {});

      ctx.send(groupedProjects);
    } catch (error) {
      console.log(error)
      ctx.throw(500, 'Error while grouping projects by parent');
    }
  }

}));
