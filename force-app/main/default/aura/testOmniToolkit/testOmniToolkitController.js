({
  handleChange: function (component, event) {
    // This will contain the string of the "value" attribute of the selected option
    const selectedOptionValue = event.getParam('value');
    component.set('v.sfStatus', selectedOptionValue);
  },

  setStatus: function (component, event) {
    const statusId = component.get('v.sfStatus');
    var omniAPI = component.find('omniToolkit');
    omniAPI
      .setServicePresenceStatus({ statusId })
      .then(function (response) {
        console.log('setServicePresenceStatus response', response);
      })
      .catch(function (error) {
        console.error(error);
      });
  },
});
