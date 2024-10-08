function Medal(props) {
  return (
    <div className="medals">
      {props.country[props.medal.name]} {props.medal.name} medals
      <div className="button">
        <button
          disabled={props.country[props.medal.name] === 0}
          onClick={() => props.onDecrement(props.country.id, props.medal.name)}
        >
          -
        </button>
        <button
          onClick={() => props.onIncrement(props.country.id, props.medal.name)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default Medal;
