import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAndPublishModuleToSection } from './contentSlice';

const AddModuleForm = ({ sectionId }) => {
    const [title, setTitle] = useState('');
    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();
        const moduleData = { title };
        dispatch(createAndPublishModuleToSection({ sectionId, moduleData }));
        setTitle(''); // Limpiar el formulario
    };

    return (
        <section style={{ border: '2px dashed #ccc', padding: '20px', marginTop: '20px' }}>
            <h3>Añadir Nuevo Módulo</h3>
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título del nuevo módulo"
                    required
                />
                <button type="submit">Crear y Publicar</button>
            </form>
        </section>
    );
};

export default AddModuleForm;