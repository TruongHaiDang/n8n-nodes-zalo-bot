import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class ZaloBotNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo Bot',
		name: 'zaloBotNode',
		group: ['transform'],
		version: 1,
		description: 'Zalo Bot',
		icon: 'file:zaloBotNode.svg',
		subtitle: '={{ $parameter["operation"] }}',
		defaults: { name: 'Zalo Bot' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],

		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Delete Webhook', value: 'deleteWebhook' },
					{ name: 'Get Me', value: 'getMe' },
					{ name: 'Get Updates', value: 'getUpdates' },
					{ name: 'Get Webhook Info', value: 'getWebhookInfo' },
					{ name: 'Send Chat Action', value: 'sendChatAction' },
					{ name: 'Send Message', value: 'sendMessage' },
					{ name: 'Send Photo', value: 'sendPhoto' },
					{ name: 'Send Sticker', value: 'sendSticker' },
					{ name: 'Set Webhook', value: 'setWebhook' },
				],
				default: 'getMe',
			},
			{
				displayName: 'Timeout',
				name: 'timeout',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 30,
				displayOptions: { show: { operation: ['getUpdates'] } },
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'https://your-webhookurl.com',
				displayOptions: { show: { operation: ['setWebhook'] } },
				required: true,
			},
			{
				displayName: 'Secret Token',
				name: 'secretToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				placeholder: 'mykey-abcyxz',
				displayOptions: { show: { operation: ['setWebhook'] } },
				required: true,
			},
			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'string',
				default: '',
				placeholder: 'abc.xyz',
				displayOptions: {
					show: {
						operation: ['sendMessage', 'sendPhoto', 'sendSticker', 'sendChatAction']
					}
				},
				required: true,
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Hello',
				displayOptions: { show: { operation: ['sendMessage'] } },
				required: true,
			},
			{
				displayName: 'Photo URL',
				name: 'photo',
				type: 'string',
				default: '',
				placeholder: 'https://placehold.co/600x400',
				displayOptions: { show: { operation: ['sendPhoto'] } },
				required: true,
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				placeholder: 'My photo',
				displayOptions: { show: { operation: ['sendPhoto'] } },
			},
			{
				displayName: 'Sticker ID',
				name: 'sticker',
				type: 'string',
				default: '',
				placeholder: '0e078a2fb66a5f34067b',
				displayOptions: { show: { operation: ['sendSticker'] } },
				required: true,
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Choose Sticker', value: 'choose_sticker' },
					{ name: 'Find Location', value: 'find_location' },
					{ name: 'Record Video', value: 'record_video' },
					{ name: 'Record Voice', value: 'record_voice' },
					{ name: 'Typing', value: 'typing' },
					{ name: 'Upload Document', value: 'upload_document' },
					{ name: 'Upload Photo', value: 'upload_photo' },
					{ name: 'Upload Video', value: 'upload_video' },
					{ name: 'Upload Voice', value: 'upload_voice' },
				],
				default: 'typing',
				displayOptions: { show: { operation: ['sendChatAction'] } },
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = (await this.getCredentials('zaloBotCredentialsApi')) as {
			botToken?: string;
		};
		const token = credentials?.botToken;
		if (!token) throw new NodeOperationError(this.getNode(), 'Missing Bot Token');

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (operation === 'getMe') {
					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/getMe`,
						headers: { 'Content-Type': 'application/json' },
						json: true,
					});

					items[i].json = res; // hoặc res.result nếu bạn chỉ muốn payload
					continue;
				}

				if (operation === 'getUpdates') {
					const timeout = this.getNodeParameter('timeout', i) as number;

					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/getUpdates`,
						headers: { 'Content-Type': 'application/json' },
						body: { timeout },
						json: true,
					});

					items[i].json = res; // hoặc res.result
					continue;
				}

				if (operation === 'getWebhookInfo') {
					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/getWebhookInfo`,
						headers: { 'Content-Type': 'application/json' },
						json: true,
					});

					items[i].json = res;
					continue;
				}

				if (operation === 'setWebhook') {
					const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
					const secretToken = this.getNodeParameter('secretToken', i) as string;

					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/setWebhook`,
						headers: { 'Content-Type': 'application/json' },
						body: {
							url: webhookUrl,
							secret_token: secretToken,
						},
						json: true,
					});

					items[i].json = res;
					continue;
				}

				if (operation === 'sendMessage') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					const text = this.getNodeParameter('text', i) as string;

					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/sendMessage`,
						headers: { 'Content-Type': 'application/json' },
						body: {
							chat_id: chatId,
							text: text,
						},
						json: true,
					});

					items[i].json = res;
					continue;
				}

				if (operation === 'sendPhoto') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					const photo = this.getNodeParameter('photo', i) as string;
					const caption = this.getNodeParameter('caption', i) as string;

					const body: any = {
						chat_id: chatId,
						photo: photo,
					};

					if (caption) {
						body.caption = caption;
					}

					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/sendPhoto`,
						headers: { 'Content-Type': 'application/json' },
						body: body,
						json: true,
					});

					items[i].json = res;
					continue;
				}

				if (operation === 'sendSticker') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					const sticker = this.getNodeParameter('sticker', i) as string;

					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/sendSticker`,
						headers: { 'Content-Type': 'application/json' },
						body: {
							chat_id: chatId,
							sticker: sticker,
						},
						json: true,
					});

					items[i].json = res;
					continue;
				}

				if (operation === 'sendChatAction') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					const action = this.getNodeParameter('action', i) as string;

					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/sendChatAction`,
						headers: { 'Content-Type': 'application/json' },
						body: {
							chat_id: chatId,
							action: action,
						},
						json: true,
					});

					items[i].json = res;
					continue;
				}

				if (operation === 'deleteWebhook') {
					const res = await this.helpers.httpRequest({
						method: 'POST',
						url: `https://bot-api.zapps.me/bot${token}/deleteWebhook`,
						headers: { 'Content-Type': 'application/json' },
						json: true,
					});

					items[i].json = res;
					continue;
				}

				throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
			} catch (err: any) {
				throw new NodeOperationError(
					this.getNode(),
					`Request failed: ${err?.message || err}`,
				);
			}
		}

		return [items];
	}
}
