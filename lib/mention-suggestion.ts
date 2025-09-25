import { SuggestionOptions } from '@tiptap/suggestion';

export interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
  email: string;
}

export const mentionSuggestion: Omit<SuggestionOptions<MentionItem>, 'editor'> = {
  items: async ({ query }) => {
    // This would typically fetch users from your database
    // For now, we'll return a mock list of users
    const users: MentionItem[] = [
      {
        id: '1',
        label: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://i.pravatar.cc/150?u=1'
      },
      {
        id: '2',
        label: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://i.pravatar.cc/150?u=2'
      },
      // Add more users as needed
    ];

    return users.filter(user => 
      user.label.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  },
  render: () => {
    let popup: HTMLElement | null = null;

    return {
      onStart: (props) => {
        popup = document.createElement('div');
        popup.className = 'mention-popup';
        document.body.appendChild(popup);
        update(props);
      },
      onUpdate: (props) => {
        update(props);
      },
      onKeyDown: (props) => {
        if (props.event.key === 'Escape') {
          popup?.remove();
          return true;
        }
        return false;
      },
      onExit: () => {
        popup?.remove();
      },
    };
  },
};

function update(props: any) {
  const { items, command, clientRect } = props;
  
  if (!clientRect || !items?.length) {
    return;
  }

  const popup = document.querySelector('.mention-popup');
  if (!popup) return;

  popup.innerHTML = `
    <div class="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden w-64">
      ${items.map((item: MentionItem) => `
        <button 
          class="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
          data-id="${item.id}"
        >
          ${item.avatar ? `
            <img src="${item.avatar}" alt="${item.label}" class="w-6 h-6 rounded-full" />
          ` : ''}
          <div>
            <div class="text-sm font-medium text-white">${item.label}</div>
            <div class="text-xs text-zinc-400">${item.email}</div>
          </div>
        </button>
      `).join('')}
    </div>
  `;

  // Position the popup
  Object.assign(popup.style, {
    position: 'absolute',
    left: `${clientRect.left}px`,
    top: `${clientRect.bottom}px`,
    zIndex: '9999',
  });

  // Add click handler for mentions
  popup.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const item = items.find((i: MentionItem) => i.id === id);
      if (item) {
        command(item);
      }
    });
  });
}

export default mentionSuggestion;
