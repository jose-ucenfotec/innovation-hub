// Guardar y Cancelar son botones en todos los formularios; Cancelar navega al origen lógico.
export default function AccionesFormulario({ textoGuardar = 'Guardar', procesando = false, onCancelar }) {
  return (
    <div className="mt-4 d-flex flex-column flex-sm-row gap-2">
      <button type="submit" className="btn btn-primary" disabled={procesando}>
        {procesando
          ? <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          : <i className="bi bi-check2" aria-hidden="true"></i>} {textoGuardar}
      </button>
      <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={procesando}>Cancelar</button>
    </div>
  );
}