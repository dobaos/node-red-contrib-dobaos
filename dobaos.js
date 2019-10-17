module.exports = function(RED) {
  const Dobaos = require("dobaos.js");
  const dobaos = Dobaos();
  dobaos.init();

  function DobaosMethod(config) {
    let method = config.method;
    RED.nodes.createNode(this,config);
    var node = this;
    node.on('input', async function(msg) {
      let response = {};
      let payload = msg.payload;
      let result = {};
      switch (method) {
        case "get description":
          try {
            result = await dobaos.getDescription(payload);
          } catch(e) {
            result = e.message;
          }
          break;
        case "get value":
          try {
            result = await dobaos.getValue(payload);
          } catch(e) {
            result = e.message;
          }
          break;
        case "read value":
          try {
            result = await dobaos.readValue(payload);
          } catch(e) {
            result = e.message;
          }
          break;
        case "set value":
          try {
            result = await dobaos.setValue(payload);
          } catch(e) {
            result = e.message;
          }
          break;
        case "get server items":
          try {
            result = await dobaos.getServerItems(payload);
          } catch(e) {
            result = e.message;
          }
          break;
        default:
          result = null;
      }
      response.payload = result;
      node.send(response);
    });
  }
  RED.nodes.registerType("dobaos-method", DobaosMethod);

  function DobaosValue(config) {
    let datapoint = parseInt(config.datapoint, 10);
    const processBaosValue = payload => {
      if (Array.isArray(payload)) {
        return payload.forEach(processBaosValue);
      }

      let {id, value} = payload;
      if (id === datapoint) {
        let msg = {};
        msg.payload = value;
        node.send(msg);
      }
    };
    dobaos.on("datapoint value", processBaosValue);

    RED.nodes.createNode(this,config);
    var node = this;
  }
  RED.nodes.registerType("dobaos-value", DobaosValue);
}

