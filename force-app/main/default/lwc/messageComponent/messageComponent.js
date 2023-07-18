import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import SERVICE_CLOUD_VOICE_MESSAGE_CHANNEL from '@salesforce/messageChannel/ServiceCloudVoiceMessageChannel__c';
import GENESYS_INTERNAL_MESSAGE_CHANNEL from '@salesforce/messageChannel/GenesysInternalMessageChannel__c';
import GENESYS_CLOUD_SCV_MESSAGE_CHANNEL from '@salesforce/messageChannel/GenesysCloudServiceCloudVoiceMessageChannel__c';

const SCV = 'SCV';
const INTERNAL = 'Internal';
const SCV_PUBLIC = 'SCV Public';
const SESSION_EVENT_TYPE = 'v2.user.session.request';
export default class MessageComponent extends LightningElement {
  messageToSend = '';
  receivedSCVMessage = '';
  receivedInternalMessage = '';
  receivedSCVPublicMessage = '';
  selectedChannel = SCV;
  channels = [
    { label: SCV, value: SCV },
    { label: INTERNAL, value: INTERNAL },
    { label: SCV_PUBLIC, value: SCV_PUBLIC },
  ];

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.subscribeToAllChannels();
  }

  get isSCVChannelSelected() {
    return this.selectedChannel === SCV;
  }

  get isInternalChannelSelected() {
    return this.selectedChannel === INTERNAL;
  }

  get isSCVPublicChannelSelected() {
    return this.selectedChannel === SCV_PUBLIC;
  }

  subscribeToAllChannels() {
    subscribe(
      this.messageContext,
      SERVICE_CLOUD_VOICE_MESSAGE_CHANNEL,
      (message) => {
        this.handleSCVMessage(message);
      },
      { scope: APPLICATION_SCOPE }
    );

    subscribe(
      this.messageContext,
      GENESYS_INTERNAL_MESSAGE_CHANNEL,
      (message) => {
        this.handleInternalMessage(message);
      },
      { scope: APPLICATION_SCOPE }
    );

    subscribe(
      this.messageContext,
      GENESYS_CLOUD_SCV_MESSAGE_CHANNEL,
      (message) => {
        this.handleSCVPublicMessage(message);
      },
      { scope: APPLICATION_SCOPE }
    );
  }

  handleChannelChange(event) {
    this.selectedChannel = event.detail.value;
  }

  showToast() {
    const event = new ShowToastEvent({
      title: 'Get Help',
      message: 'Salesforce documentation is available in the app. Click ? in the upper-right corner.',
    });
    this.dispatchEvent(event);
  }

  requestInternalSession() {
    publish(this.messageContext, GENESYS_INTERNAL_MESSAGE_CHANNEL, { source: 'custom', eventType: SESSION_EVENT_TYPE, payload: null });
  }

  handleChange(event) {
    this.messageToSend = event.target.value;
  }

  publishMessage() {
    const message = JSON.parse(this.messageToSend);
    if (this.isSCVChannelSelected) {
      publish(this.messageContext, SERVICE_CLOUD_VOICE_MESSAGE_CHANNEL, { source: 'custom', ...message });
    } else if (this.isInternalChannelSelected) {
      publish(this.messageContext, GENESYS_INTERNAL_MESSAGE_CHANNEL, { source: 'custom', ...message });
    } else if (this.isSCVPublicChannelSelected) {
      publish(this.messageContext, GENESYS_CLOUD_SCV_MESSAGE_CHANNEL, { source: 'custom', ...message });
    }
  }

  handleSCVMessage(message) {
    if (message.source !== 'LWC') {
      let newMessage = message ? JSON.stringify(message.payload, null, '\t') : 'no message payload';
      this.receivedSCVMessage += newMessage + '\n\n';
    }
  }

  handleInternalMessage(message) {
    if (message.source !== 'custom') {
      let newMessage = message ? JSON.stringify(message.payload, null, '\t') : 'no message payload';
      this.receivedInternalMessage += newMessage + '\n\n';
    }
  }

  handleSCVPublicMessage(message) {
    if (message.source !== 'custom') {
      let newMessage = message ? JSON.stringify(JSON.parse(message.payload), null, '\t') : 'no message payload';
      this.receivedSCVPublicMessage += message.eventType + '\n' + newMessage + '\n\n';
    }
  }

  clearMessages() {
    if (this.isSCVChannelSelected) {
      this.receivedSCVMessage = '';
    } else if (this.isInternalChannelSelected) {
      this.receivedInternalMessage = '';
    } else if (this.isSCVPublicChannelSelected) {
      this.receivedSCVPublicMessage = '';
    }
  }

  clearAllMessages() {
    this.receivedSCVMessage = '';
    this.receivedInternalMessage = '';
    this.receivedSCVPublicMessage = '';
  }
}
