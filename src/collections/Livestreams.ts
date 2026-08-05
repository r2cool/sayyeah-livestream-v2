import type { CollectionConfig } from 'payload'

export const Livestreams: CollectionConfig = {
  slug: 'livestreams',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      required: true,
      label: 'YouTube URL or Video ID',
      admin: {
        description: 'Paste the YouTube video link (e.g. https://www.youtube.com/watch?v=XYZ), embed link, or 11-character video ID.',
      },
    },
    {
      name: 'logoType',
      type: 'select',
      defaultValue: 'svg',
      options: [
        { label: 'SVG Raw Code', value: 'svg' },
        { label: 'Upload Image', value: 'image' },
      ],
      required: true,
    },
    {
      name: 'logoSvg',
      type: 'textarea',
      label: 'Logo SVG Raw Code',
      admin: {
        condition: (data) => data?.logoType === 'svg',
        description: 'Paste the SVG raw HTML code (e.g. <svg>...</svg>).',
      },
    },
    {
      name: 'logoImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo Image',
      admin: {
        condition: (data) => data?.logoType === 'image',
      },
    },
    {
      name: 'theme',
      type: 'group',
      label: 'Theme Customization',
      fields: [
        {
          name: 'backgroundColor',
          type: 'text',
          defaultValue: '#e5f6fd',
          label: 'Background Color',
        },
        {
          name: 'textColor',
          type: 'text',
          defaultValue: '#000000',
          label: 'Text Color',
        },
        {
          name: 'buttonColor',
          type: 'text',
          defaultValue: '#00AEEF',
          label: 'Submit Button Color',
        },
        {
          name: 'buttonTextColor',
          type: 'text',
          defaultValue: '#ffffff',
          label: 'Submit Button Text Color',
        },
        {
          name: 'font',
          type: 'select',
          defaultValue: 'system-ui',
          options: [
            { label: 'System UI', value: 'system-ui' },
            { label: 'Inter', value: 'Inter' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Outfit', value: 'Outfit' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Open Sans', value: 'Open Sans' },
            { label: 'Montserrat', value: 'Montserrat' },
            { label: 'Lato', value: 'Lato' },
            { label: 'Custom Google Font', value: 'custom' },
          ],
        },
        {
          name: 'customFontName',
          type: 'text',
          label: 'Custom Google Font Name',
          admin: {
            condition: (data) => data?.theme?.font === 'custom',
            description: 'Enter the exact Google Font name (e.g. Playfair Display).',
          },
        },
      ],
    },
    {
      name: 'chat',
      type: 'group',
      label: 'IVS Chat Configuration',
      fields: [
        {
          name: 'chatRoomArn',
          type: 'text',
          defaultValue: 'arn:aws:ivschat:eu-west-1:533267334105:room/lDKNWdeinKjR',
          label: 'AWS IVS Chat Room ARN',
        },
        {
          name: 'chatEndpoint',
          type: 'text',
          defaultValue: 'https://5gkn9rs7p3.execute-api.eu-west-1.amazonaws.com/Prod//auth',
          label: 'Auth Endpoint URL',
        },
        {
          name: 'websocketEndpoint',
          type: 'text',
          defaultValue: 'wss://edge.ivschat.eu-west-1.amazonaws.com',
          label: 'WebSocket Endpoint URL',
        },
      ],
    },
    {
      name: 'text',
      type: 'group',
      label: 'Text Customization',
      fields: [
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'Vul hier uw bericht in',
          label: 'Chat Input Placeholder',
        },
        {
          name: 'buttonText',
          type: 'text',
          defaultValue: 'Verstuur',
          label: 'Submit Button Text',
        },
        {
          name: 'instruction',
          type: 'text',
          defaultValue: 'Vul hierboven uw bericht in en klik op verstuur',
          label: 'Instruction text under chat',
        },
        {
          name: 'successMessage',
          type: 'text',
          defaultValue: 'Uw bericht is verstuurd en ontvangen',
          label: 'Success Message Toast',
        },
        {
          name: 'errorMessage',
          type: 'text',
          defaultValue: 'Er is iets misgegaan. Ververs de pagina en probeer opnieuw uw bericht in te sturen',
          label: 'Error Message Toast',
        },
        {
          name: 'toastSuccessColor',
          type: 'text',
          defaultValue: '#00AEEF',
          label: 'Success Toast Color',
        },
        {
          name: 'toastErrorColor',
          type: 'text',
          defaultValue: '#FFAE00',
          label: 'Error Toast Color',
        },
      ],
    },
  ],
}
