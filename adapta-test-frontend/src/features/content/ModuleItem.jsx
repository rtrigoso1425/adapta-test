import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Supondremos que crearemos estas acciones en contentSlice
import { getLessonsForModule, createLessonInModule, resetLessons } from './contentSlice';

const AddLessonForm = ({ moduleId }) => {
    const [title, setTitle] = useState('');
    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();
        const lessonData = { title, content: 'Contenido de ejemplo...' };
        dispatch(createLessonInModule({ moduleId, lessonData }));
        setTitle('');
    };

    return (
        <form onSubmit={onSubmit} style={{ marginTop: '10px', marginLeft: '20px' }}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nueva lección"
                required
            />
            <button type="submit">Añadir Lección</button>
        </form>
    );
};

const ModuleItem = ({ module }) => {
    const [isOpen, setIsOpen] = useState(false); // Estado para mostrar/ocultar lecciones
    const dispatch = useDispatch();

    // Obtenemos el estado de las lecciones del slice de contenido
    const { lessonsByModule, isLoadingLessons } = useSelector((state) => state.content);
    const lessons = lessonsByModule[module._id] || [];

    useEffect(() => {
        if (isOpen) {
            dispatch(getLessonsForModule(module._id));
        } else {
            dispatch(resetLessons(module._id)); // Limpiar lecciones al cerrar
        }
    }, [isOpen, dispatch, module._id]);

    return (
        <div style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0' }}>
            <h3 onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                {module.title} {isOpen ? '[-]' : '[+]'}
            </h3>
            {isOpen && (
                <div>
                    {isLoadingLessons ? <p>Cargando lecciones...</p> : (
                        lessons.length > 0 ? (
                            <ul>
                                {lessons.map(lesson => <li key={lesson._id}>{lesson.title}</li>)}
                            </ul>
                        ) : <p>Este módulo no tiene lecciones.</p>
                    )}
                    <AddLessonForm moduleId={module._id} />
                </div>
            )}
        </div>
    );
};

export default ModuleItem;