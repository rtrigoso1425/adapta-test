import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCareerById, reset } from '../features/careers/careerSlice';
import { ArrowLeft, BookOpen, Clock, User, GraduationCap } from 'lucide-react';

const CurriculumViewPage = () => {
    const { id: careerId } = useParams();
    const dispatch = useDispatch();
    
    const { myCareer: career, isLoading } = useSelector((state) => state.careers);

    useEffect(() => {
        dispatch(getCareerById(careerId));

        return () => {
            dispatch(reset());
        };
    }, [dispatch, careerId]);

    if (isLoading || !career) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <h3 className="text-xl font-semibold text-foreground">Cargando malla curricular...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Compact Header */}
            <div className="bg-card text-foreground shadow-md border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <Link 
                        to="/dashboard" 
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Volver al Dashboard</span>
                    </Link>
                    
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-lg backdrop-blur-sm">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2">{career.name}</h1>
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Coordinador:</span>
                                    <span className="font-semibold text-foreground">{career.coordinator?.name || 'No asignado'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Duración:</span>
                                    <span className="font-semibold text-foreground">{career.duration}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {career.curriculum && career.curriculum.length > 0 ? (
                    <div className="grid gap-4">
                        {career.curriculum.map((cycle, index) => (
                            <div 
                                key={cycle.cycleNumber}
                                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                {/* Cycle Header */}
                                <div className="bg-gradient-to-r from-black to-gray-800 px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white text-black rounded-full w-9 h-9 flex items-center justify-center font-bold text-base">
                                            {cycle.cycleNumber}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">
                                                Ciclo {cycle.cycleNumber}
                                            </h2>
                                            <p className="text-gray-300 text-xs mt-0.5">
                                                {cycle.courses?.length || 0} curso{cycle.courses?.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Courses List */}
                                <div className="p-5">
                                    {cycle.courses && cycle.courses.length > 0 ? (
                                        <div className="grid gap-2">
                                            {cycle.courses.map((course, courseIndex) => (
                                                <div 
                                                    key={course._id}
                                                    className="group flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-black hover:text-white transition-all duration-300 border border-transparent hover:border-black"
                                                >
                                                    <div className="text-black group-hover:text-white flex-shrink-0 w-8 h-8 rounded-md bg-white group-hover:bg-white/10 flex items-center justify-center font-bold text-xs border border-gray-200 group-hover:border-white/20">
                                                        {courseIndex + 1}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                                        <span className="font-semibold text-sm text-gray-800 group-hover:text-white transition-colors">
                                                            {course.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                                <BookOpen className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium text-sm">
                                                No hay cursos asignados a este ciclo
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <GraduationCap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Malla curricular no definida
                        </h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            La malla curricular aún no ha sido definida para esta carrera. 
                            Por favor, contacta al coordinador para más información.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurriculumViewPage;