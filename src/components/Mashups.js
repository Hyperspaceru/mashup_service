import React from 'react';
import '../css/Mashups.css';

const Mashups = ({ mashupList, updateHook, loading }) => {
    if (loading) {
        return (
            <h2>Loading..</h2>
        )
    }
    function handleApprove(event, elemId) {
        const [id, publicId] = elemId.split('_')
        let newMashup = mashupList.find(mashup => mashup.id === Number(id) && mashup.publicId === Number(publicId))
        if (newMashup) {
            newMashup.approve = !newMashup.approve
            updateHook(newMashup)
        }
    }
    return (
        <table className='mashups'>
            <thead>
                <tr>
                    <th className='mashups__checkbox_header'></th>
                    <th className='mashups__title_header'>Title</th>
                    <th>Likes</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody className='mashups__tbody'>
                {mashupList.map((mashup) => (
                    <tr key={`${mashup.id}_${mashup.publicId}`}>
                        <td>
                            <label>
                                <input className="mashups__checkbox" type="checkbox" onChange={(event) => { handleApprove(event, `${mashup.id}_${mashup.publicId}`) }} checked={mashup.approve ? true : false} />
                                <span></span>
                            </label>
                        </td>
                        <td>
                            <a className="mashups__link" target="_blank" href={mashup.postLink}>{`${mashup.author} - ${mashup.title}`}</a>
                        </td>
                        <td>
                            {mashup.likes}
                        </td>
                        <td>
                            {new Date(mashup.postDate).toLocaleDateString()}
                        </td>
                        <td>
                            {mashup.status}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Mashups