import projectType from "../../project-type/controllers/project-type";

const { factories } = require('@strapi/strapi');
const csv = require('csv-parser'); // Install this library using `npm install csv-parser`
const fs = require('fs');

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
  },
  async vineStructureData(ctx) {
    console.log("vine structure data endpoint called");
    try {
      const projects = await strapi.entityService.findMany('api::project.project', {
        fields: ['Name', 'Date', 'ParentVine', 'Locations', 'VenueInstitute', 'Description'],
        populate: {
            Tags: {fields: ['Name']},  
            Type: {fields: ['Type']}, 
            vineImages: true,
            galleryImages: true
          }
      });
  
      console.log('Generated Query:', projects.query);  // Logs the query Strapi is executing
  
      // Create the transformed data structure directly in the format needed by the visualization
      const transformedData = {};
  
      // Group projects by year first
      projects.forEach(project => {
        const year = project.Date;
        if (!transformedData[year]) {
          transformedData[year] = {};
        }
        
        const parentVine = project.ParentVine;
        if (!transformedData[year][parentVine]) {
          transformedData[year][parentVine] = [];
        }
        
        transformedData[year][parentVine].push(project);
      });
  
      // Add yearIndex to each year for correct positioning in visualization
      const sortedYears = Object.keys(transformedData).sort();
      sortedYears.forEach((year, index) => {
        transformedData[year].yearIndex = index;
      });
  
      ctx.send(transformedData);
    } catch (error) {
      console.log(error)
      ctx.throw(500, 'Error while grouping projects by year');
    }
  },

  async uploadCsv(ctx) {
    console.log("uploadCsv endpoint called");

    try {
      // const { files } = ctx.request.files;
      const  files  = ctx.request.files;
      console.log('Received files:', files); // Log the received files for debugging
      if (!files || !files.csv) {
        return ctx.throw(400, 'XXXX CSV file is required');
      }
      console.log('Survived firt error'); 

      const csvFile = Array.isArray(files.csv) ? files.csv[0]: files.csv; // Handle the case when multiple files are uploaded
      const projects = [];

      // Parse the CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvFile.filepath)
          .pipe(csv({
            mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '')
          }))
          .on('data', (row) => projects.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
      console.log('Parsed CSV data with project count:', projects.length); // Log the parsed CSV data for debugging
      for (const project of projects) {
        console.log('Processing project:', project); // Log each project being processed
        console.log('Processing project name :', project['Name']); // Log each project being processed

        // Check and create Tags
        const tags = project.Tags.split(',').map((tag) => tag.trim());
        const tagIds = [];
        for (const tag of tags) {
          console.log('Checking tag:', tag); // Log each tag being processed
          const existingTag = await strapi.entityService.findMany('api::tag.tag', {
            filters: { Name: tag },
          });
          if (existingTag.length === 0) {
            console.log('Creating new tag:', tag); // Log when a new tag is created
            const newTag = await strapi.entityService.create('api::tag.tag', {
              data: { Name: tag },
            });
            tagIds.push(newTag.id);
          } else {
            tagIds.push(existingTag[0].id);
          }
        }

        // Check and create Type
        const type = project.Type.trim();
        let typeId = null;
        console.log('Checking type:', type); // Log each type being processed

        const existingType = await strapi.entityService.findMany('api::project-type.project-type', {
          filters: { Type: type },
        });
        if (existingType.length === 0) {
          console.log('Creating new type:', type); // Log when a new type is created
          const newType = await strapi.entityService.create('api::project-type.project-type', {
            data: { Type: type },
          });
          typeId = newType.id;
        } else {
          typeId = existingType[0].id;
        }

        // Create or update the Project
        await strapi.entityService.create('api::project.project', {
          data: {
            Name: project['Name'],
            Date: project.Date,
            Description: project.Description,
            ParentVine: project.ParentVine,
            Tags: tagIds,
            Type: typeId,
            Locations: project.Locations,
          },
        });
      }

      ctx.send({ message: 'CSV processed successfully' });
    } catch (error) {
      console.error(error);
      ctx.throw(500, 'Error processing CSV file');
    }
  },

  async testUpload(ctx) {
    console.log("Test upload endpoint called");

    try {
      console.log("Request files:", ctx.request.files);

      const { files } = ctx.request.files;
      if (!files || !files.csv) {
        return ctx.throw(400, 'CSV file is required');
      }

      const csvFile = files.csv;
      console.log("CSV File Info:", csvFile);

      ctx.send({ message: 'File received successfully', file: csvFile });
    } catch (error) {
      console.error(error);
      ctx.throw(500, 'Error processing file');
    }
  },
}));
