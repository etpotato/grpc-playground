import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './__generated/service';
import './client';

const host = '0.0.0.0:8080';
const packageDefinition = protoLoader.loadSync('./src/proto/service.proto', {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

const client = new proto.TimeService(
  host,
  grpc.credentials.createInsecure()
);

function run() {
  console.log('run')
  client.GetTime({}, (error?: grpc.ServiceError | null, response?: any) => {
    if (error) {
      console.error(error.message);
    } else {
      console.log(`(client) Got server message: ${response.isoTime}`);
    }
  })

  client.addDays({ days: 3 }, (error?: grpc.ServiceError | null, response?: any) => {
    if (error) {
      console.error('(client) error:', error.message);
    } else {
      console.log(`(client) Got server message: ${response.isoTime}`);
    }
  })
}

run();
