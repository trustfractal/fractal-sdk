import { v4 as uuidv4 } from "uuid";

import redux from "@redux";
import appActions from "@redux/app";
import requestsActions from "@redux/requests";
import { requestsWatcher } from "@redux/middleware/watcher";

import RequestStatus from "@models/Request/RequestStatus";
import RequestTypes from "@models/Request/RequestTypes";
import ContentScriptConnection from "@models/Connection/ContentScriptConnection";
import types from "@models/Connection/types";

async function init() {
  const contentScript = new ContentScriptConnection();
  const store = await redux.init();

  store.dispatch(appActions.startup());

  contentScript.on(
    types.CONFIRM_CREDENTIAL,
    ({ port, payload: [content, target] }) =>
      new Promise((resolve, reject) => {
        const request = {
          id: uuidv4(),
          requester: target.address,
          content: {
            attester: content.attestation.owner,
            claimer: content.request.claim.owner,
            properties: content.request.claim.contents,
            ctype: content.request.claim.cTypeHash,
            claim: content,
          },
          type: RequestTypes.CONFIRM_CREDENTIAL,
        };

        store.dispatch(requestsActions.addRequest(request));

        // create callbacks
        const onAccept = async (acceptedRequest) => {
          // commit credential to the blockchain
          const transactionHash = await contentScript.invoke(
            port,
            types.COMMIT_CREDENTIAL,
            acceptedRequest.content,
          );

          resolve(transactionHash);
        };
        const onDecline = () => reject(RequestStatus.DECLINED);

        const onTimeout = () => {
          store.dispatch(requestsActions.removeRequest(request.id));

          reject(RequestStatus.TIMED_OUT);
        };

        requestsWatcher.listenForRequest(
          request.id,
          onAccept,
          onDecline,
          onTimeout,
        );
      }),
  );
}

init();
