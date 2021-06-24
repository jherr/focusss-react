import { Focusss } from "./Focusss";

function App() {
  return (
    <div>
      <canvas></canvas>

      <Focusss>
        {(onFocus) => (
          <div className="form-wrapper">
            <form>
              <label htmlFor="name">Name</label>
              <input
                onFocus={(evt) => onFocus(evt.target)}
                type="text"
                id="name"
              />

              <label htmlFor="email">Email</label>
              <input
                onFocus={(evt) => onFocus(evt.target)}
                type="text"
                id="email"
              />

              <label htmlFor="password">Password</label>
              <input
                onFocus={(evt) => onFocus(evt.target)}
                type="password"
                id="password"
              />

              <button onFocus={(evt) => onFocus(evt.target)}>
                Submit The Thing
              </button>
            </form>
          </div>
        )}
      </Focusss>
    </div>
  );
}

export default App;
