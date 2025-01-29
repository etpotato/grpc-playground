import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { TimeServiceHandlers } from './__generated/TimeService';
import { TimeResponse } from './__generated/TimeResponse';
import { Days } from './__generated/Days';
import { ProtoGrpcType } from './__generated/service';
import { IsDateDto } from './__generated/IsDateDto';
import { IsDateRequest } from './__generated/IsDateRequest';
import { IsDateResponse } from './__generated/IsDateResponse';

const host = '0.0.0.0:8080';

const exampleServer: TimeServiceHandlers = {
  GetTime(
    call: grpc.ServerUnaryCall<any, TimeResponse>,
    callback: grpc.sendUnaryData<TimeResponse>
  ) {
    if (call.request) {
      console.log('(server) Got client message', JSON.stringify(call.request, null, 2));
    }
    callback(null, {
      isoTime: new Date().toISOString(),
    });
  },
  AddDays(
    call: grpc.ServerUnaryCall<Days, TimeResponse>,
    callback: grpc.sendUnaryData<TimeResponse>
  ) {
    if (call.request) {
      console.log('(server) Got client message', JSON.stringify(call.request, null, 2));
    }

    if (!call.request.days || Number.isNaN(Number(call.request.days))) {
      callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Invalid days input' });
      return;
    }

    callback(null, {
      isoTime: new Date(new Date().valueOf() + (call.request.days || 0) * 24 * 60 * 60 * 1000).toISOString(),
    });
  },
  IsDate(call: grpc.ServerDuplexStream<IsDateRequest, IsDateResponse>) {
    call.on('data', ({ date }: IsDateRequest) => {
      console.log('(server) Got client message', JSON.stringify(date, null, 2));
      call.write({ isDate: date ? !Number.isNaN(Date.parse(date)) : false });
    });
  }
};

function getServer(): grpc.Server {
  const packageDefinition = protoLoader.loadSync('./src/proto/service.proto', {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const ProtoGrpc = grpc.loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoGrpcType;
  const server = new grpc.Server();
  server.addService(ProtoGrpc.TimeService.service, exampleServer);
  return server;
}

if (require.main === module) {
  const server = getServer();
  server.bindAsync(
    host,
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
      if (err) {
        console.error(`Server error: ${err.message}`);
      } else {
        console.log(`Server bound on port: ${port}`);
      }
    }
  );
}
