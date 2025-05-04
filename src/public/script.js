document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const message = document.getElementById('message');
  const downloadLink = document.getElementById('downloadLink');
  const errorMessage = document.getElementById('errorMessage');
  const translatedText = document.getElementById('translatedText');
  const copyButton = document.getElementById('copyButton');
  const estimatedTime = document.getElementById('estimatedTime');

  // Kiểm tra DOM elements
  if (!form || !resultDiv || !errorDiv || !message || !downloadLink || !errorMessage || !translatedText || !copyButton || !estimatedTime) {
    console.error('Missing DOM elements:', {
      form: !!form,
      resultDiv: !!resultDiv,
      errorDiv: !!errorDiv,
      message: !!message,
      downloadLink: !!downloadLink,
      errorMessage: !!errorMessage,
      translatedText: !!translatedText,
      copyButton: !!copyButton,
      estimatedTime: !!estimatedTime,
    });
    return;
  }

  // Hàm gửi embed tới Discord qua webhook
  async function sendDiscordEmbed(userId, fileName, fileCount) {
    const webhookUrl = 'https://discord.com/api/webhooks/1368492089041748062/sk8xD3ixuXfuV30hYR2SvpIf47UDGWRletx5zinexcBxTlyu6Vq3s6W9SduYSG3-bKNE'; // Thay bằng URL webhook của bạn
    const embed = {
      embeds: [
        {
          title: '✅ Dịch Hoàn Tất',
          description: 'Bản dịch đã hoàn thành và gửi thành công!',
          color: 5763719,
          fields: [
            { name: 'Người dùng', value: userId, inline: true },
            { name: 'Tệp gốc', value: fileName, inline: true },
            { name: 'Số tệp đã dịch', value: fileCount.toString(), inline: true },
          ],
          footer: { text: 'Gửi lúc' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed),
      });
      if (response.ok) {
        console.log('Discord embed sent successfully');
      } else {
        console.error('Failed to send Discord embed:', response.statusText);
      }
    } catch (err) {
      console.error('Error sending Discord embed:', err.message);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    translatedText.textContent = 'Translating...';
    estimatedTime.textContent = 'Estimating time...';

    const formData = new FormData(form);
    const userId = 'Người dùng trên web'; 
    formData.append('userId', userId);

    try {
      console.log('Sending request to /api/files/translate');
      const response = await fetch('/api/files/translate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Translation successful:', data);
        estimatedTime.textContent = `Estimated time: ${data.estimatedTime} seconds`;
        translatedText.textContent = data.translatedContent || 'No translated content available';
        console.log('Translated content set:', data.translatedContent);
        console.log('Estimated time set:', data.estimatedTime);

        // Gửi embed tới Discord
        const fileName = formData.get('file')?.name || 'Unknown file';
        await sendDiscordEmbed(userId, fileName, 1);
      } else {
        console.error('Translation error:', data);
        errorMessage.textContent = data.error + (data.details ? `: ${data.details}` : '');
        errorDiv.classList.remove('hidden');
        translatedText.textContent = 'Error occurred. No translated content available.';
        estimatedTime.textContent = 'Estimation failed';
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      errorMessage.textContent = 'Failed to connect to server: ' + err.message;
      errorDiv.classList.remove('hidden');
      translatedText.textContent = 'Error occurred. No translated content available.';
      estimatedTime.textContent = 'Estimation failed';
    }
  });

  // Xử lý nút Copy
  copyButton.addEventListener('click', () => {
    console.log('Copy button clicked');
    const textToCopy = translatedText.textContent;
    if (textToCopy && textToCopy !== 'Upload a file to see translated content here...' && textToCopy !== 'Translating...') {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          console.log('Content copied to clipboard');
          alert('Translated content copied to clipboard!');
        })
        volunteerrror(err => {
          console.error('Failed to copy:', err);
          alert('Failed to copy content: ' + err.message);
        });
    } else {
      console.warn('No valid content to copy');
      alert('No translated content to copy!');
    }
  });
});