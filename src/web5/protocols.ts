import { DwnApi } from "@web5/api";


const tasksProtocolSchema = "https://schema.org/TaskSample";
const tasksProtocolTypeTaskSchema = "https://schema.org/TaskSample/schemas/name";


export const tasksProtocolDefinition = {
  published: true,
  protocol: tasksProtocolSchema,
  types: {
    task: {
      dataFormats: ["application/json"],
      schema: tasksProtocolTypeTaskSchema,
    }
  },
  structure: {
    task: {
      $tags: {
        $requiredTags: ["completed"],
        completed: {
          type: "boolean"
        }
      }
    }
  }
}

export const task = {
  definition: tasksProtocolDefinition,
  uri: tasksProtocolSchema,
  schemas: {
    task: tasksProtocolTypeTaskSchema,
  }
}


const protocolSchema =  "https://areweweb5yet.com/protocols/profile";

export const profileDefinition = {
  published: true,
  protocol: "https://areweweb5yet.com/protocols/profile",
  types: {
    name: {
      dataFormats: ['application/json']
    },
    social: {
      dataFormats: ['application/json']
    },
    messaging: {
      dataFormats: ['application/json']
    },
    phone: {
      dataFormats: ['application/json']
    },
    address: {
      dataFormats: ['application/json']
    },
    career: {
      dataFormats: ['application/json']
    },
    payment: {
      dataFormats: ['application/json']
    },
    connect: {
      dataFormats: ['application/json']
    },
    avatar: {
      dataFormats: ['image/gif', 'image/png', 'image/jpeg', 'image/webp']
    },
    hero: {
      dataFormats: ['image/gif', 'image/png', 'image/jpeg', 'image/webp']
    }
  },
  structure: {
    name: {},
    social: {},
    career: {},
    avatar: {},
    hero: {},
    messaging: {},
    address: {},
    phone: {},
    payment: {},
    connect: {}
  }
}

export const profile = {
  definition: profileDefinition,
  uri: protocolSchema,
};

export const byUri = {
  [profileDefinition.protocol]: profile,
  [tasksProtocolDefinition.protocol]: task,
};

export const installProtocols = async (dwn: DwnApi, did: string) => {
  const installed = await dwn.protocols.query({ message: {} });
  const configurationPromises = [];
  console.info(JSON.stringify(profileDefinition), { profile });
  try {
    for (const protocolUri in byUri) {
      const record = installed.protocols.find(
        (record) => protocolUri === record.definition.protocol
      );
      if (!record) {
        console.info("installing protocol: " + protocolUri);
        const definition = byUri[protocolUri].definition;
        configurationPromises.push(
          dwn.protocols.configure({
            message: { definition },
          })
        );
      } else {
        console.info("protocol already installed: " + protocolUri);
      }
    }

    const configurationResponses = await Promise.all(configurationPromises);
    try {
      await Promise.all(
        configurationResponses.map(({ protocol }) => protocol?.send(did))
      );
    } catch (e) {
      console.log("remote push of configuration failed", e);
      return true;
    }
  } catch (e) {
    console.log("local install of configuration failed", e);
    return false;
  }
  return true;
};
