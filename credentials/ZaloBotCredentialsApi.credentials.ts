import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ZaloBotCredentialsApi implements ICredentialType {
	name = 'zaloBotCredentialsApi';
	displayName = 'Zalo Bot Credentials API';

	documentationUrl = 'https://bot.zapps.me/docs/create-bot';

	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Bot Token',
			name: 'botToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		}
	];
}
