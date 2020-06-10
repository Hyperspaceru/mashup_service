import React from 'react';
import '../css/Approve.css';

function Approve() {
    return (
        <div className="Approve">
            <h2 className="approve__header">Wait for approve</h2>
            <table className='approve__table'>
                <thead>
                    <tr>
                        <th></th>
                        <th>Video</th>
                        <th>Source</th>
                        <th>Audio</th>
                    </tr>
                </thead>
                <tbody className='approve__tbody'>
                    <tr>
                        <td><input type="checkbox" name="" id="" /></td>
                        <td>2</td>
                        <td>1</td>
                        <td><i class="fas fa-play"></i></td>
                    </tr>
                </tbody>
            </table>
            <div className="approve__controls">
            <button className='button approve__accept'><i class="fas fa-check"></i><span>Approve checked</span></button>
                <button className='button approve__unmark'><i class="fas fa-check"></i><span>Unmark all</span></button>
                <button className='button'><i class="fas fa-check"></i><span>Mark all</span></button>
                
                
            </div>

        </div>
    );
}

export default Approve;