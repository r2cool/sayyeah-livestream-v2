import type { CollectionConfig } from 'payload'

export const Livestreams: CollectionConfig = {
  slug: 'livestreams',
  admin: {
    useAsTitle: 'title',
    preview: ({ slug }) => `https://live.studiosayyeah.nl/${slug}`,
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
      name: 'accessMode',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Password', value: 'password' },
        { label: 'Username Required', value: 'username' },
      ],
      required: true,
    },
    {
      name: 'password',
      type: 'text',
      label: 'Password',
      admin: {
        condition: (data) => data?.accessMode === 'password',
        description: 'Enter the password required to view this livestream.',
      },
      validate: (value: string | null | undefined, { data }: any) => {
        if (data?.accessMode === 'password' && !value) {
          return 'Password is required when access mode is set to Password'
        }
        return true
      },
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      required: true,
      label: 'YouTube URL or Video ID',
      admin: {
        description:
          'Paste the YouTube video link (e.g. https://www.youtube.com/watch?v=XYZ), embed link, or 11-character video ID.',
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
          defaultValue:
            'Er is iets misgegaan. Ververs de pagina en probeer opnieuw uw bericht in te sturen',
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
    {
      name: 'text_password_form',
      type: 'group',
      label: 'Password Form',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Wachtwoord Vereist',
          label: 'Title Text',
        },
        {
          name: 'instruction',
          type: 'text',
          defaultValue: 'Voer het wachtwoord in om toegang te krijgen tot de livestream.',
          label: 'Instruction text under password form',
        },
        {
          name: 'labelText',
          type: 'text',
          defaultValue: 'Wachtwoord',
          label: 'Password Label',
        },
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'Vul hier uw wachtwoord in',
          label: 'Password Input Placeholder',
        },
        {
          name: 'buttonText',
          type: 'text',
          defaultValue: 'Stream ontgrendelen',
          label: 'Button Text',
        },
        {
          name: 'errorMessage',
          type: 'text',
          defaultValue: 'Onjuist wachtwoord. Probeer het opnieuw.',
          label: 'Error Message Toast',
        },
      ],
    },
    {
      name: 'text_username_form',
      type: 'group',
      label: 'Username Form',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Gebruikersnaam Invoeren',
          label: 'Title Text',
        },
        {
          name: 'instruction',
          type: 'text',
          defaultValue:
            'Voer een gebruikersnaam in om deel te nemen aan de chat en de stream te bekijken.',
          label: 'Instruction text under password form',
        },
        {
          name: 'labelText',
          type: 'text',
          defaultValue: 'Gebruikersnaam',
          label: 'Username Label',
        },
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'Kies een gebruikersnaam',
          label: 'Username Input Placeholder',
        },
        {
          name: 'buttonText',
          type: 'text',
          defaultValue: 'Deelnemen',
          label: 'Button Text',
        },
      ],
    },
  ],
}
