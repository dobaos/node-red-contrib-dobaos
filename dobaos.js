module.exports = function(RED) {
  const Dobaos = require("dobaos.js");
  const dobaos = Dobaos();
  dobaos.init();

  function DobaosMethod(config) {
    RED.nodes.createNode(this, config);
    let cMethod = config.method;
    let cPayload = config.payload;
    let cPayloadType = config.payloadType;
    let flow = this.context().flow;
    let global = this.context().global;
    var node = this;
    node.on('close', async function() {
      // do something
    });
    node.on('input', async function(msg) {
      let response = {};
      let result = {};
      let payload;
      if (cPayloadType === "msg")
        payload = msg[cPayload];
      else if (cPayloadType === "flow")
        payload = flow[cPayload];
      else if (cPayloadType === "global")
        payload = global[cPayload];
      else if (cPayloadType === "json")
        payload = JSON.parse(cPayload);
      switch (cMethod) {
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
        case "get stored":
          try {
            result = await dobaos.getStored(payload);
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
        case "put value":
          try {
            result = await dobaos.putValue(payload);
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
    var node = this;
    let datapoint = JSON.parse(config.datapoint);
    const processBaosValue = payload => {
      if (Array.isArray(payload)) {
        return payload.forEach(processBaosValue);
      }

      let {id, value} = payload;
      let name = "";
      if (payload.hasOwnProperty("name")) {
        name = payload.name;
      }

      // should value be triggered in node-red?
      let trigger;
      if (Array.isArray(datapoint)) {
        // if id is presented in given array
        trigger = datapoint.includes(id) || datapoint.includes(name);
      } else if (typeof datapoint === "number") {
        // if only one number was given
        if (datapoint === 0) {
          // if 0 id was provided, react on any dpt
          trigger = true;
        } else {
          trigger = id === datapoint;
        }
      } else if (typeof datapoint === "string") {
        // if only one number was given
        if (datapoint === "") {
          trigger = true;
        } else {
          trigger = name === datapoint;
        }
      }
      if (trigger) {
        let msg = {};
        msg.method = "datapoint value";
        msg.payload = payload;
        node.send(msg);
      }
    };
    dobaos.on("datapoint value", processBaosValue);
    RED.nodes.createNode(this,config);
    node.on('close', async function() {
      // do something
      dobaos.removeListener("datapoint value", processBaosValue);
    });
  }
  RED.nodes.registerType("dobaos-value", DobaosValue);
}
