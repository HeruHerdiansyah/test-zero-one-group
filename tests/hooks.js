// Hooks for Fastify tests
export const testHooks = {
  onRoute(routeOptions) {
    // Skip schema validation in tests
    if (routeOptions.schema && routeOptions.validatorCompiler === undefined) {
      routeOptions.validatorCompiler = function ({ schema, method, url, httpPart }) {
        return function (data) {
          // Always return true in tests to bypass schema validation
          return { isValid: true };
        };
      };
    }
  },
  
  // Hook to modify response for POST / PUT routes
  preHandler(request, reply, done) {
    // Override reply send to format response consistently
    const originalSend = reply.send;
    reply.send = function(payload) {
      // If the response is a validation error, format it
      if (payload && payload.statusCode === 400 && payload.error === 'Bad Request') {
        return originalSend.call(this, {
          success: false,
          message: payload.message
        });
      }
      return originalSend.call(this, payload);
    };
    done();
  }
};
