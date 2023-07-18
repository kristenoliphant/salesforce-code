import { LightningElement, wire } from 'lwc';
import GENESYS_CLOUD_SCV_MESSAGE_CHANNEL from '@salesforce/messageChannel/GenesysCloudServiceCloudVoiceMessageChannel__c';
import { MessageContext, publish, subscribe, APPLICATION_SCOPE } from 'lightning/messageService';

const EVENTS = {
  V2: {
    CONVERSATION: {
      DETAIL: {
        REQUEST: 'v2.conversation.detail.request',
        RESPONSE: 'v2.conversation.detail.response',
      },
    },
  },
};

export default class ToolkitComponent extends LightningElement {
  callId = '';
  events = '';
  eventType = '';
  conversationDetail = '';

  constructor() {
    super();
    this.telephonyEventListener = this.handleTelephonyEvent.bind(this);
  }

  @wire(MessageContext)
  messageContext;

  renderedCallback() {
    this.subscribeToVoiceToolkit();
    this.registerPublicMessageChannelEvents();
    this.subscribeToPublicMessageChannel();
  }

  subscribeToVoiceToolkit() {
    const toolkitApi = this.getToolkitApi();
    toolkitApi.addEventListener('callstarted', this.telephonyEventListener);
    toolkitApi.addEventListener('callconnected', this.telephonyEventListener);
    toolkitApi.addEventListener('callended', this.telephonyEventListener);
    toolkitApi.addEventListener('mute', this.telephonyEventListener);
    toolkitApi.addEventListener('unmute', this.telephonyEventListener);
    toolkitApi.addEventListener('hold', this.telephonyEventListener);
    toolkitApi.addEventListener('resume', this.telephonyEventListener);
    toolkitApi.addEventListener('participantadded', this.telephonyEventListener);
    toolkitApi.addEventListener('participantremoved', this.telephonyEventListener);
    toolkitApi.addEventListener('swap', this.telephonyEventListener);
    toolkitApi.addEventListener('conference', this.telephonyEventListener);
    toolkitApi.addEventListener('pauserecording', this.telephonyEventListener);
    toolkitApi.addEventListener('resumerecording', this.telephonyEventListener);
  }

  getToolkitApi() {
    return this.template.querySelector('lightning-service-cloud-voice-toolkit-api');
  }

  registerPublicMessageChannelEvents() {
    this.messageEventHandlers = {};
    this.messageEventHandlers[EVENTS.V2.CONVERSATION.DETAIL.RESPONSE] = this.handleConversationDetail;
  }

  subscribeToPublicMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        GENESYS_CLOUD_SCV_MESSAGE_CHANNEL,
        (message) => {
          if (message.source !== 'LWC') {
            if (this.messageEventHandlers[message.eventType]) {
              this.messageEventHandlers[message.eventType].bind(this)(message.payload);
            }
          }
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  handleTelephonyEvent(event) {
    this.eventType = event.type;
    this.callId = event.detail.callId;
    this.events += this.eventType + '\n' + JSON.stringify(event.detail, null, '\t') + '\n\n';
  }

  handleConversationDetail(message) {
    const parsedMessage = JSON.parse(message);
    this.conversationDetail += JSON.stringify(parsedMessage, null, '\t') + '\n\n';
  }

  handleCallIdChange(event) {
    this.callId = event.detail.value;
  }

  getConversationDetail() {
    this.publishMessage({ eventType: EVENTS.V2.CONVERSATION.DETAIL.REQUEST, payload: { callId: this.callId } });
  }

  publishMessage({ eventType, payload = {} }) {
    publish(this.messageContext, GENESYS_CLOUD_SCV_MESSAGE_CHANNEL, { eventType, payload });
  }

  clearEvents() {
    this.events = '';
  }

  clearConversationDetail() {
    this.conversationDetail = '';
  }
}
