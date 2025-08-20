import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAssignment } from './assignmentSlice';

const AddAssignmentForm = ({ sectionId }) => {
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();
        const assignmentData = { title, instructions };
        dispatch(createAssignment({ sectionId, assignmentData }));
        setTitle('');
        setInstructions('');
    };

    return (
        <section style={{ border: '2px dashed #ccc', padding: '20px', marginTop: '20px' }}>
            <h3>Crear Nueva Tarea</h3>
            <form onSubmit={onSubmit}>
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la tarea"
                        required
                        style={{ width: '90%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Instrucciones de la tarea..."
                        style={{ width: '90%', padding: '8px', height: '100px' }}
                    />
                </div>
                <button type="submit">Crear Tarea</button>
            </form>
        </section>
    );
};

export default AddAssignmentForm;