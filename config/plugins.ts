export default () => ({
    upload: {
      config: {
        provider: 'local', // Use the local provider for file uploads
        providerOptions: {
          sizeLimit: 1000000, // Set a size limit for uploads (in bytes)
        },
      },
    },
  });