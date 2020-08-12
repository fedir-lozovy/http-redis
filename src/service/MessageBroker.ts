import Message from '../interfaces/Message';

export default abstract class MessageBroker {

    abstract init();

    abstract publish(message: Message);

    abstract subscribe(handler: Function);
}