import React from 'react';

const EventContext = React.createContext(null);

const { Provider, Consumer } = EventContext;

const withEventBus = Component => {
  return props => {
    return (
      <Consumer>
        {eventBus => (
          <Component eventBus={eventBus} {...props}>
            {props.children}
          </Component>
        )}
      </Consumer>
    );
  };
};

export { Provider, Consumer, withEventBus };

export default EventContext;
