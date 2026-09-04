import { useState } from "react";

export default function Contacto() {
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setEnviado(true);
  }

  return (
    <main className="fondo">
      <h1>Contacto</h1>
      <aside className="altapag">
        <div>
          <form className="formularioAlta" onSubmit={handleSubmit}>
            <label htmlFor="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="mensaje">Mensaje:</label>
            <textarea id="mensaje" name="mensaje" rows="4" required></textarea>

            {enviado && <p className="alerta-exito">¡Gracias! Te vamos a responder pronto.</p>}

            <input className="botonAlta" type="submit" value="Enviar" />
          </form>
        </div>
      </aside>
    </main>
  );
}
