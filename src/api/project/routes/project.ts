module.exports = {
    routes: [
      // Custom endpoint: Group projects by year
      {
        method: 'GET',
        path: '/projects/group-by-year',
        handler: 'project.groupByYear',
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/projects/group-by-parent',
        handler: 'project.groupByParent', 
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/projects/vine-structure-data',
        handler: 'project.vineStructureData', 
        config: {
          auth: false,
        },
      },
      {
        method: 'POST',
        path: '/projects/upload-csv',
        handler: 'project.uploadCsv', // Ensure you have this method in your controller to handle CSV uploads
        config: {
          auth: false,
        },
      },
      {
        method: 'POST',
        path: '/projects/test-upload-csv',
        handler: 'project.testUpload', // Ensure you have this method in your controller to handle CSV uploads
        config: {
          auth: false,
        },
      },
      // Default Strapi routes for the "projects" API
      {
        method: 'GET',
        path: '/projects',
        handler: 'project.find',
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/projects/:id',
        handler: 'project.findOne',
        config: {
          auth: false,
        },
      },
      {
        method: 'POST',
        path: '/projects',
        handler: 'project.create',
        config: {
          auth: false,
        },
      },
      {
        method: 'PUT',
        path: '/projects/:id',
        handler: 'project.update',
        config: {
          auth: false,
        },
      },
      {
        method: 'DELETE',
        path: '/projects/:id',
        handler: 'project.delete',
        config: {
          auth: false,
        },
      },
    ],
  };
  