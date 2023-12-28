

function Counter()
{
  const [count, setCount] = useState(0);

  return <>
    <p>{count}</p>
    <button id="counter-button" onClick={() => setCount(count+1)}>Click MEEE</button>
  </>
}

export default Counter;