import React, { useState } from 'react';

const OpenAIChat = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer YOUR_OPENAI_API_KEY_HERE`, // 🛑 Don't commit this to GitHub
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      })
    });

    const data = await res.json();
    setResponse(data.choices[0].message.content);
  };

  return (
    <div className="p-4">
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Ask something..."
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSubmit} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Ask GPT
      </button>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded">{response}</div>
      )}
    </div>
  );
};

export default OpenAIChat;
