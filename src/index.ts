import { handleRequest } from './handler';
import { InteractionResponseFlags, InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request) {
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const requestTwo = request.clone();
  const rawBody = await request.text();
  const isValidRequest = verifyKey(rawBody, signature, timestamp, 'MY_PUBLIC_KEY');

  if (!isValidRequest) {
    return new Response('Invalid signture', {status:401});
  }

  
  else {
    const json = await requestTwo.json();
    if (json.type === InteractionType.PING) {
      const response = JSON.stringify({
        type: InteractionResponseType.PONG
      });
      return new Response(response);
    }

    if (json.type === 3) {
      if (json.data.custom_id === "test-dropdown") {
        const response = JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Thanks for applying!',
            flags: InteractionResponseFlags.EPHEMERAL
          }
        });
        return new Response(response, {
          headers: {
            'Content-type': 'application/json'
          }
        });
      }
    }

    if (json.type === InteractionType.APPLICATION_COMMAND) {
      if (json.data.name === 'dropdown') {
        let minValue, maxValue;
        const kvp = optionsToObject(json.data.options);
        minValue = kvp['min'];
        maxValue = kvp ['max'];

        if (minValue < 1) {
          const response = JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {              
              flags: InteractionResponseFlags.EPHEMERAL,
              content: 'Min must be larger than 1'
            }
          });
          return new Response(response, { headers: { 'Content-type': 'application/json '}});
        }

        if (maxValue > 3) {
          const response = JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              content: 'Choose a max less than 3. I didn\'t have enough time to make more things.'
            }
          });
          return new Response(response, { headers: { 'Content-type': 'application/json '}});
        }

        if (minValue > maxValue) {
          const response = JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              content: 'Bruh.'
            }
          });
          return new Response(response, { headers: { 'Content-type': 'application/json '}});
        }        

        const response = JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Mason is looking for new arena partners. What classes do you play?',
            "components": [
              {
                "type": 1,
                "components": [{
                    "type": 3,
                    "custom_id": "test-dropdown",
                    "options": EXAMPLE_VALUES,
                    "placeholder": "Choose a class",
                    "min_values": minValue,
                    "max_values": maxValue
                }]
              }   
            ]
          }
        });
        return new Response(response, {
          headers: {
            'Content-type': 'application/json'
          }
        });
      }
    }
  }
}

const EXAMPLE_VALUES = [
  {
    'label': 'Rogue',
    'value': 'rogue',
    'description': 'Sneak n stab',
    'emoji': {
      'name': 'rogue',
      'id': '625891304148303894'
    }
  },
  {
    'label': 'Mage',
    'value': 'mage',
    'description': 'Turn \'em into a sheep',
    'emoji': {
      'name': 'mage',
      'id': '625891304081063986'
    }
  },
  {
    'label': 'Priest',
    'value': 'priest',
    'description': 'You get heals when I\'m done doing damage',
    'emoji': {
      'name': 'priest',
      'id': '625891303795982337'
    }
  }
]

type InteractionOption = {
  name: string,
  value: number
}

function optionsToObject(options: Array<InteractionOption> | null): any {
  if (options == null) {
    return {
      min: 1,
      max: 1
    }
  }
  return options.reduce((x, y) => ({...x, [y.name]: y.value}), {});
}